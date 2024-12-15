import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { check, Match } from 'meteor/check';
import '../imports/api/euribor.js';
import { HTTP } from 'meteor/http';

function formatNumber(value, decimals = 0) {
  if (!value && value !== 0) return '0';
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatPercentage(value, decimals = 2) {
  if (!value && value !== 0) return '0%';
  return value.toLocaleString('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatCurrency(value, decimals = 0) {
  if (!value && value !== 0) return '0 EUR';
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

async function sendEmailViaSmtp2Go(options) {
  const apiKey = Meteor.settings.smtp.apiKey;
  
  // Create email template with Amberlake branding
  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="background: #DD772A; padding: 1.5rem; text-align: center;">
        <img src="https://amberlakepartners.com/assets/logos/horizontal_logo.png" alt="Amberlake Partners" style="height: 50px; width: auto;">
      </div>

      <div style="padding: 2rem;">
        ${options.html}
      </div>

      <div style="margin-top: 2rem; padding: 1.5rem; background: #f8f9fa; border-radius: 8px;">
        <h3 style="color: #2c3e50;">Contact Us</h3>
        <p>For more information or to discuss your financing needs, please contact us:</p>
        <p><strong>Email:</strong> <a href="mailto:contact@amberlakepartners.com">contact@amberlakepartners.com</a></p>
        <p><strong>Phone/WhatsApp:</strong> <a href="tel:+37792001712">+377 92 00 17 12</a></p>
        <p>Our team of experts is ready to assist you with your real estate financing requirements.</p>
      </div>

      <div style="margin-top: 1rem; font-size: 0.8em; color: #666;">
        <p>The calculations provided above are purely indicative and do not constitute a formal offer of financing. 
        Actual financing terms may vary based on individual circumstances, market conditions, and final assessment.</p>
      </div>
    </div>
  `;

  try {
    const result = HTTP.call('POST', 'https://api.smtp2go.com/v3/email/send', {
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': apiKey
      },
      data: {
        sender: Meteor.settings.smtp.username,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html_body: emailTemplate.replace('${options.html}', options.html),
        text_body: options.text
      }
    });
    
    // Send copy to contact@amberlakepartners.com
    if (options.to !== 'contact@amberlakepartners.com' && options.to !== 'mf@amberlakepartners.com') {
      HTTP.call('POST', 'https://api.smtp2go.com/v3/email/send', {
        headers: {
          'Content-Type': 'application/json',
          'X-Smtp2go-Api-Key': apiKey
        },
        data: {
          sender: Meteor.settings.smtp.username,
          to: ['contact@amberlakepartners.com'],
          subject: `Copy: ${options.subject} (sent to ${options.to})`,
          html_body: emailTemplate.replace('${options.html}', 
            `<p>A calculation was sent to ${options.to}</p>${options.html}`
          ),
          text_body: `A calculation was sent to ${options.to}\n\n${options.text}`
        }
      });
    }
    
    console.log('Email sent successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Meteor.Error('email-failed', 'Failed to send email via SMTP2GO');
  }
}

Meteor.startup(() => {
  console.log('Server started');
  
  // Test EURIBOR fetching on startup
  Meteor.call('euribor.get3M', (err, res) => {
    if (err) {
      console.error('Error fetching EURIBOR:', err);
    } else {
      console.log('EURIBOR 3M rate on startup:', res);
    }
  });
});

Meteor.methods({
  async getEuriborRate() {
    return Meteor.call('euribor.get3M');
  },

  sendSimulationEmail(data) {
    const {
      emailAddress,
      interestRate,
      totalLoan,
      annualLoanCost,
      collateralRequired,
      quarterlyCashFlow,
      affordabilityText,
      mortgagePart,
      lombardPart,
      lang
    } = data;

    const i18nEmail = {
      en: {
        subject: "Your Prime Real Estate Financing Simulation",
        text:
`Below are the results of your simulation (Indicative):

Interest Rate (Annual): ${formatPercentage(interestRate/100)}
Total Loan Amount: ${formatCurrency(totalLoan)}
Annual Loan Cost (Interest): ${formatCurrency(annualLoanCost)}
Collateral Required: ${formatCurrency(collateralRequired)}
Quarterly Net Cash Flow from Portfolio: ${formatCurrency(quarterlyCashFlow)}
Affordability (Cost vs. 35% of Revenues): ${affordabilityText}
Mortgage Part (60% of Property Value): ${formatCurrency(mortgagePart)}
Lombard Part (Guaranteed by Portfolio): ${formatCurrency(lombardPart)}

These calculations are indicative and do not constitute any form of advice or commitment.
`
      },
      fr: {
        subject: "Votre Simulation de Financement Immobilier Prime",
        text:
`Voici les résultats de votre simulation (indicatifs) :

Taux d'Intérêt (Annuel) : ${formatPercentage(interestRate/100)}
Montant Total du Prêt : ${formatCurrency(totalLoan)}
Coût Annuel du Prêt (Intérêts) : ${formatCurrency(annualLoanCost)}
Garantie Demandée : ${formatCurrency(collateralRequired)}
Flux de Trésorerie Trimestriel Net du Portefeuille : ${formatCurrency(quarterlyCashFlow)}
Accessibilité (Coût vs. 35% des Revenus) : ${affordabilityText}
Part Hypothécaire (60% de la Valeur du Bien) : ${formatCurrency(mortgagePart)}
Partie Lombard (Garantie par le Portefeuille) : ${formatCurrency(lombardPart)}

Ces calculs sont fournis à titre indicatif et ne constituent ni un conseil ni un engagement.
`
      }
    };

    const subject = i18nEmail[lang].subject;
    const text = i18nEmail[lang].text;

    Email.send({
      to: emailAddress,
      from: "no-reply@amberlakepartners.com",
      subject,
      text
    });

    Email.send({
      to: "mf@amberlakepartners.com",
      from: "no-reply@amberlakepartners.com",
      subject: "Simulation copy",
      text: `A simulation was done and sent to ${emailAddress}:\n\n${text}`
    });

    console.log('Emails sent');
  },

  async 'sendResultsEmail'(data) {
    console.log('1. Starting sendResultsEmail method with data:', data);

    check(data, {
      to: String,
      results: Match.ObjectIncluding({
        interestRate: String,
        totalLoan: String,
        annualLoanCost: String,
        collateralRequired: String,
        annualCashFlow: String,
        affordability: String,
        mortgagePart: String,
        lombardPart: String
      })
    });

    const html = `
      <h2 style="text-align: center; color: #2c3e50;">Your Real Estate Financing Calculation Results</h2>
      
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin: 2rem 0;">
        <div style="flex: 1; min-width: 300px; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="padding: 1rem; border-bottom: 1px solid #eee;">
            <div style="color: #666; margin-bottom: 0.5rem;">
              <i class="fas fa-percentage" style="color: #DD772A;"></i>
              Interest Rate at Inception
            </div>
            <div style="font-size: 1.2rem; font-weight: 500; color: #DD772A;">
              ${data.results.interestRate}
            </div>
          </div>

          <div style="padding: 1rem; border-bottom: 1px solid #eee;">
            <div style="color: #666; margin-bottom: 0.5rem;">
              <i class="fas fa-euro-sign" style="color: #DD772A;"></i>
              Total Loan Amount
            </div>
            <div style="font-size: 1.2rem; font-weight: 500; color: #2c3e50;">
              ${data.results.totalLoan}
            </div>
          </div>

          <div style="padding: 1rem;">
            <div style="color: #666; margin-bottom: 0.5rem;">
              <i class="fas fa-coins" style="color: #DD772A;"></i>
              Annual Loan Cost
            </div>
            <div style="font-size: 1.2rem; font-weight: 500; color: #e74c3c;">
              ${data.results.annualLoanCost}
            </div>
          </div>
        </div>

        <div style="flex: 1; min-width: 300px; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="padding: 1rem; border-bottom: 1px solid #eee;">
            <div style="color: #666; margin-bottom: 0.5rem;">
              <i class="fas fa-shield-alt" style="color: #DD772A;"></i>
              Financial Collateral Required
            </div>
            <div style="font-size: 1.2rem; font-weight: 500;">
              ${data.results.collateralRequired}
            </div>
          </div>

          <div style="padding: 1rem; border-bottom: 1px solid #eee;">
            <div style="color: #666; margin-bottom: 0.5rem;">
              <i class="fas fa-chart-line" style="color: #DD772A;"></i>
              Annual Net Cash Flow
            </div>
            <div style="font-size: 1.2rem; font-weight: 500; color: #27ae60;">
              ${data.results.annualCashFlow}
            </div>
          </div>

          <div style="padding: 1rem;">
            <div style="color: #666; margin-bottom: 0.5rem;">
              <i class="fas fa-balance-scale" style="color: #DD772A;"></i>
              Affordability
            </div>
            <div style="font-size: 1.2rem; font-weight: 500; background: ${data.results.affordability.includes('Yes') ? '#d4edda' : '#f8d7da'}; color: ${data.results.affordability.includes('Yes') ? '#155724' : '#721c24'}; padding: 0.25rem 0.75rem; border-radius: 4px;">
              ${data.results.affordability}
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 2rem; background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="color: #2c3e50;">Loan Structure</h3>
        <div style="background: #f8f9fa; border-radius: 4px; overflow: hidden; margin: 1rem 0;">
          <div style="display: flex; height: 35px;">
            <div style="background: #DD772A; color: white; padding: 0.5rem; text-align: center; width: 60%;">
              ${data.results.mortgagePart}
            </div>
            <div style="background: #2ecc71; color: white; padding: 0.5rem; text-align: center; width: 40%;">
              ${data.results.lombardPart}
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 1rem;">
          <span style="display: inline-block; margin: 0 1rem;">
            <i style="color: #DD772A; margin-right: 0.5rem;">■</i> Mortgage Part
          </span>
          <span style="display: inline-block; margin: 0 1rem;">
            <i style="color: #2ecc71; margin-right: 0.5rem;">■</i> Lombard Part
          </span>
        </div>
      </div>
    `;

    try {
      await sendEmailViaSmtp2Go({
        to: data.to,
        subject: 'Your Real Estate Financing Calculation Results',
        html: html,
        text: html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
      });

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Meteor.Error('email-failed', 'Failed to send email');
    }
  }
});
