import { Template } from 'meteor/templating';
import numeral from 'numeral';
import './main.html';

// Set up numeral locale for French
numeral.register('locale', 'fr', {
  delimiters: {
    thousands: ' ',
    decimal: ','
  },
  abbreviations: {
    thousand: 'k',
    million: 'M',
    billion: 'B',
    trillion: 'T'
  },
  currency: {
    symbol: '€'
  }
});

// Global variables
const i18n = {
  en: {
    pageTitle: "Prime Real Estate Financing Calculator",
    labelPurchasePrice: "Purchase Price",
    labelEuribor: "EURIBOR 3M",
    labelBankMargin: "Bank Margin (%)",
    labelLtvProperty: "Loan To Value (Property) (%)",
    labelLtvPortfolio: "Loan To Value (Portfolio) (%)",
    labelPortfolioYield: "Investment Portfolio Yield (% p.a.)",
    labelAnnualRevenue: "Annual Revenue of Borrower",
    labelEmailAddress: "Email to receive the simulation",
    calculateBtn: "Calculate",
    resultsTitle: "Results (Indicative):",
    resInterestRateLabel: "Interest Rate at Inception:",
    resTotalLoanLabel: "Total Loan Amount:",
    resAnnualLoanCostLabel: "Annual Loan Cost (Interest):",
    resCollateralRequiredLabel: "Financial Collateral Required:",
    resQuarterlyCashFlowLabel: "Annual Net Cash Flow from Portfolio:",
    resAffordabilityLabel: "Affordability (Cost vs. 35% of Revenues):",
    resMortgagePartLabel: "Mortgage Part (60% of Property Value):",
    resLombardPartLabel: "Lombard Part (Guaranteed by Portfolio):",
    disclaimerTitle: "Disclaimer",
    disclaimerText: "These calculations are indicative and do not constitute any form of advice or commitment.",
    resNetCostLabel: "Net Cost of the Loan (Annual Cash Flow - Annual Cost):",
  },
  fr: {
    pageTitle: "Calculateur de Financement Immobilier Prime",
    labelPurchasePrice: "Prix d'achat",
    labelEuribor: "EURIBOR 3M",
    labelBankMargin: "Marge Bancaire (%)",
    labelLtvProperty: "Loan To Value (Propriété) (%)",
    labelLtvPortfolio: "Loan To Value (Portefeuille) (%)",
    labelPortfolioYield: "Rendement du Portefeuille d'Investissement (% p.a.)",
    labelAnnualRevenue: "Revenu Annuel de l'Emprunteur",
    labelEmailAddress: "Email pour recevoir la simulation",
    calculateBtn: "Calculer",
    resultsTitle: "Résultats (Indicatifs) :",
    resInterestRateLabel: "Taux d'Intérêt Initial :",
    resTotalLoanLabel: "Montant Total du Prêt :",
    resAnnualLoanCostLabel: "Coût Annuel du Prêt (Intérêts) :",
    resCollateralRequiredLabel: "Garantie Financière Requise :",
    resQuarterlyCashFlowLabel: "Flux de Trésorerie Annuel Net du Portefeuille :",
    resAffordabilityLabel: "Accessibilité (Coût vs. 35% des Revenus) :",
    resMortgagePartLabel: "Part Hypothécaire (60% de la Valeur du Bien) :",
    resLombardPartLabel: "Partie Lombard (Garantie par le Portefeuille) :",
    disclaimerTitle: "Avertissement",
    disclaimerText: "Ces calculs sont fournis à titre indicatif et ne constituent ni un conseil ni un engagement.",
    resNetCostLabel: "Coût Net du Prêt (Flux de Trésorerie Annuel - Coût Annuel) :",
  }
};

let currentLang = 'en';

// Default values
const defaultValues = {
  bankMargin: 1.1,
  ltvProperty: 60,
  portfolioYield: 6
};

function formatInputNumber(value, isPercentage = false) {
  if (!value) return '';
  const num = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  if (isNaN(num)) return '';
  return isPercentage ? numeral(num).format('0,0.00') : numeral(num).format('0,0');
}

async function setDefaultValues() {
  try {
    // Get live EURIBOR rate
    const euriborRate = await Meteor.callAsync('getEuriborRate');
    
    // Set default values for inputs
    document.getElementById('euribor').value = formatInputNumber(euriborRate, true);
    document.getElementById('bankMargin').value = formatInputNumber(defaultValues.bankMargin, true);
    document.getElementById('ltvProperty').value = formatInputNumber(defaultValues.ltvProperty, true);
    document.getElementById('portfolioYield').value = formatInputNumber(defaultValues.portfolioYield, true);
    document.getElementById('ltvPortfolio').value = "70";
  } catch (error) {
    console.error('Error setting default values:', error);
  }
}

function updateLanguage(lang) {
  currentLang = lang;
  numeral.locale(lang);

  // Update all text elements
  Object.entries(i18n[lang]).forEach(([key, text]) => {
    const element = document.getElementById(key);
    if (element) element.textContent = text;
  });

  // Update active state of language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// Template events and helpers
Template.calculator.onRendered(async function() {
  updateLanguage('en');
  await setDefaultValues();
});

Template.calculator.events({
  'click .lang-btn'(event) {
    const target = event.target.closest('.lang-btn');
    if (target) {
      const lang = target.dataset.lang;
      updateLanguage(lang);
    }
  },

  'input .number-input'(event) {
    const input = event.target;
    if (input.type === 'text') {
      // For currency inputs (purchasePrice and annualRevenue)
      let value = input.value.replace(/[^0-9]/g, '');
      
      // Show warning if format is incorrect
      if (!/^\d*$/.test(value)) {
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
        // Format with spaces for thousands
        if (value) {
          value = parseInt(value, 10).toLocaleString('fr-FR');
          input.value = value;
        }
      }
    }
  },

  'submit #financing-form'(event) {
    event.preventDefault();
    const purchasePrice = getNumericValue(event.target.purchasePrice.value);
    const euribor = getNumericValue(event.target.euribor.value);
    const bankMargin = getNumericValue(event.target.bankMargin.value);
    const ltvProperty = getNumericValue(event.target.ltvProperty.value);
    const portfolioYield = getNumericValue(event.target.portfolioYield.value);
    const annualRevenue = getNumericValue(event.target.annualRevenue.value);

    // Total loan is equal to purchase price
    const totalLoan = purchasePrice;
    console.log('Total Loan:', totalLoan);

    // Calculate mortgage part (using ltvProperty from input)
    const mortgagePart = purchasePrice * (ltvProperty / 100);
    console.log('Mortgage Part:', mortgagePart);

    // Calculate required portfolio (hardcoded 60%)
    const portfolioRequired = totalLoan * 0.60;
    console.log('Portfolio Required:', portfolioRequired);

    // Calculate lombard part (remaining loan amount)
    const lombardPart = totalLoan - mortgagePart;
    console.log('Lombard Part:', lombardPart);

    // Calculate interest rate (Euribor + margin)
    const interestRate = (euribor + bankMargin) / 100;
    console.log('Interest Rate:', interestRate);

    // Calculate annual loan cost
    const annualLoanCost = totalLoan * interestRate;
    console.log('Annual Loan Cost:', annualLoanCost);

    // Calculate annual portfolio cash flow
    const annualCashFlow = portfolioRequired * (portfolioYield / 100);
    console.log('Annual Cash Flow:', annualCashFlow);

    // Calculate net cost of the loan
    const netCost = annualCashFlow - annualLoanCost;
    console.log('Net Cost:', netCost);

    // Calculate affordability ratio
    let affordabilityRatio = 0;
    let isAffordable = false;
    let affordabilityText = '';
    
    if (annualRevenue > 0) {
      affordabilityRatio = annualLoanCost / annualRevenue;
      isAffordable = annualLoanCost <= (annualRevenue * 0.35);
      affordabilityText = `${isAffordable ? 'Yes' : 'No'}, annual cost is ${formatPercentage(affordabilityRatio)} of annual revenue`;
    } else {
      affordabilityText = 'Please enter annual revenue to calculate affordability';
    }

    // Update display
    document.querySelector('.results').style.display = 'block';
    
    // Update all result fields with null checks
    const updateElement = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };

    updateElement('interestRate', formatPercentage(interestRate));
    updateElement('totalLoan', formatCurrency(totalLoan));
    updateElement('annualLoanCost', formatCurrency(annualLoanCost));
    updateElement('collateralRequired', formatCurrency(portfolioRequired));
    updateElement('quarterlyCashFlow', formatCurrency(annualCashFlow));
    updateElement('netCost', formatCurrency(netCost));
    updateElement('affordability', affordabilityText);

    // Update loan structure bars
    const mortgagePercentage = (mortgagePart / totalLoan) * 100;
    const lombardPercentage = (lombardPart / totalLoan) * 100;

    const mortgageBar = document.getElementById('mortgageBar');
    const lombardBar = document.getElementById('lombardBar');

    if (mortgageBar) {
      mortgageBar.style.width = `${mortgagePercentage}%`;
      mortgageBar.setAttribute('aria-valuenow', mortgagePercentage);
      mortgageBar.textContent = `Mortgage: ${formatCurrency(mortgagePart)}`;
    }

    if (lombardBar) {
      lombardBar.style.width = `${lombardPercentage}%`;
      lombardBar.setAttribute('aria-valuenow', lombardPercentage);
      lombardBar.textContent = `Lombard: ${formatCurrency(lombardPart)}`;
    }

    // Update affordability styling
    const affordabilityElement = document.getElementById('affordability');
    if (affordabilityElement) {
      affordabilityElement.className = annualRevenue > 0
        ? (isAffordable ? 'status-value success-bg' : 'status-value warning-bg')
        : 'status-value';
    }
  },

  'click .send-results'(event) {
    const email = document.getElementById('emailResults').value;
    if (!email) {
      showEmailModal('error', 'Please enter an email address');
      return;
    }

    const results = {
      interestRate: document.getElementById('interestRate').textContent,
      totalLoan: document.getElementById('totalLoan').textContent,
      annualLoanCost: document.getElementById('annualLoanCost').textContent,
      collateralRequired: document.getElementById('collateralRequired').textContent,
      annualCashFlow: document.getElementById('quarterlyCashFlow').textContent,
      affordability: document.getElementById('affordability').textContent,
      mortgagePart: document.getElementById('mortgageBar').textContent,
      lombardPart: document.getElementById('lombardBar').textContent,
      netCost: document.getElementById('netCost').textContent,
    };

    Meteor.call('sendResultsEmail', { to: email, results }, (error) => {
      if (error) {
        showEmailModal('error', 'Failed to send email. Please try again.');
        console.error('Email error:', error);
      } else {
        showEmailModal('success', 'Results sent successfully!');
        document.getElementById('emailResults').value = '';
      }
    });
  }
});

function parseFormattedNumber(value) {
  if (!value) return 0;
  return Number(value.toString().replace(/[^\d.-]/g, ''));
}

function formatCurrency(value) {
  if (!value && value !== 0) return '€0';
  // Use numeral.js for consistent formatting
  return `€${numeral(value).format('0,0')}`;
}

function formatPercentage(value) {
  if (!value && value !== 0) return '0%';
  return `${(value * 100).toFixed(2)}%`;
}

// When getting values from inputs, use this helper:
function getNumericValue(value) {
  return parseFloat(value.replace(/[€%\s]/g, '').replace(/,/g, ''));
}

function showEmailModal(type, message) {
  const modalBody = document.getElementById('emailModalBody');
  const modalTitle = document.getElementById('emailModalLabel');
  
  if (type === 'success') {
    modalBody.innerHTML = `
      <div class="alert alert-success mb-0">
        <i class="fas fa-check-circle me-2"></i>
        ${message}
      </div>
    `;
    modalTitle.textContent = 'Success';
  } else {
    modalBody.innerHTML = `
      <div class="alert alert-danger mb-0">
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
      </div>
    `;
    modalTitle.textContent = 'Error';
  }

  const modal = new bootstrap.Modal(document.getElementById('emailModal'));
  modal.show();
}
