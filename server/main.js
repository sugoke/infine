import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import '../imports/api/euribor.js';

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
  }
});
