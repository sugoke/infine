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
    labelPurchasePrice: "Purchase Price (including acquisition costs)",
    labelEuribor: "EURIBOR 3M",
    labelBankMargin: "Bank Margin (%)",
    labelLtvProperty: "Loan To Value (Property) (%)",
    labelLtvPortfolio: "Loan To Value (Portfolio) (%)",
    labelPortfolioYield: "Investment Portfolio Yield (% p.a.)",
    labelAnnualRevenue: "Annual Revenue of Borrower",
    labelEmailAddress: "Email to receive the simulation",
    calculateBtn: "Calculate",
    resultsTitle: "Results (Indicative):",
    resInterestRateLabel: "Interest Rate (Annual):",
    resTotalLoanLabel: "Total Loan Amount:",
    resAnnualLoanCostLabel: "Annual Loan Cost (Interest):",
    resCollateralRequiredLabel: "Financial Collateral Required:",
    resQuarterlyCashFlowLabel: "Annual Net Cash Flow from Portfolio:",
    resAffordabilityLabel: "Affordability (Cost vs. 35% of Revenues):",
    resMortgagePartLabel: "Mortgage Part (60% of Property Value):",
    resLombardPartLabel: "Lombard Part (Guaranteed by Portfolio):",
    disclaimerTitle: "Disclaimer",
    disclaimerText: "These calculations are indicative and do not constitute any form of advice or commitment."
  },
  fr: {
    pageTitle: "Calculateur de Financement Immobilier Prime",
    labelPurchasePrice: "Prix d'achat (frais inclus)",
    labelEuribor: "EURIBOR 3M",
    labelBankMargin: "Marge Bancaire (%)",
    labelLtvProperty: "Loan To Value (Propriété) (%)",
    labelLtvPortfolio: "Loan To Value (Portefeuille) (%)",
    labelPortfolioYield: "Rendement du Portefeuille d'Investissement (% p.a.)",
    labelAnnualRevenue: "Revenu Annuel de l'Emprunteur",
    labelEmailAddress: "Email pour recevoir la simulation",
    calculateBtn: "Calculer",
    resultsTitle: "Résultats (Indicatifs) :",
    resInterestRateLabel: "Taux d'Intérêt (Annuel) :",
    resTotalLoanLabel: "Montant Total du Prêt :",
    resAnnualLoanCostLabel: "Coût Annuel du Prêt (Intérêts) :",
    resCollateralRequiredLabel: "Garantie Financière Requise :",
    resQuarterlyCashFlowLabel: "Flux de Trésorerie Annuel Net du Portefeuille :",
    resAffordabilityLabel: "Accessibilité (Coût vs. 35% des Revenus) :",
    resMortgagePartLabel: "Part Hypothécaire (60% de la Valeur du Bien) :",
    resLombardPartLabel: "Partie Lombard (Garantie par le Portefeuille) :",
    disclaimerTitle: "Avertissement",
    disclaimerText: "Ces calculs sont fournis à titre indicatif et ne constituent ni un conseil ni un engagement."
  }
};

let currentLang = 'en';

// Default values
const defaultValues = {
  bankMargin: 0.60,
  ltvProperty: 60,
  ltvPortfolio: 60,
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
    document.getElementById('ltvPortfolio').value = formatInputNumber(defaultValues.ltvPortfolio, true);
    document.getElementById('portfolioYield').value = formatInputNumber(defaultValues.portfolioYield, true);
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
    input.value = input.value.replace(/[^\d.-]/g, '');
  },

  'submit #financing-form'(event) {
    event.preventDefault();

    // Get raw numeric values
    const purchasePrice = Number(event.target.purchasePrice.value);
    const euribor = Number(event.target.euribor.value) / 100;
    const bankMargin = Number(event.target.bankMargin.value) / 100;
    const ltvProperty = Number(event.target.ltvProperty.value) / 100;
    const portfolioYield = Number(event.target.portfolioYield.value) / 100;
    const annualRevenue = Number(event.target.annualRevenue.value);

    // Total loan is equal to purchase price
    const totalLoan = purchasePrice;
    console.log('Total Loan:', totalLoan);

    // Calculate mortgage part (60% of property value)
    const mortgagePart = purchasePrice * 0.60;
    console.log('Mortgage Part:', mortgagePart);

    // Calculate required portfolio (60% of total loan)
    const portfolioRequired = totalLoan * 0.60;
    console.log('Portfolio Required:', portfolioRequired);

    // Calculate lombard part (remaining loan amount)
    const lombardPart = totalLoan - mortgagePart;
    console.log('Lombard Part:', lombardPart);

    // Calculate interest rate (Euribor + margin)
    const interestRate = euribor + bankMargin;
    console.log('Interest Rate:', interestRate);

    // Calculate annual loan cost
    const annualLoanCost = totalLoan * interestRate;
    console.log('Annual Loan Cost:', annualLoanCost);

    // Calculate annual portfolio cash flow instead of quarterly
    const annualCashFlow = portfolioRequired * portfolioYield;
    console.log('Annual Cash Flow:', annualCashFlow);

    // Calculate affordability ratio
    const affordabilityRatio = annualLoanCost / annualRevenue;
    const isAffordable = annualLoanCost <= (annualRevenue * 0.35);
    console.log('Affordability:', { ratio: affordabilityRatio, isAffordable });

    // Update display
    document.querySelector('.results').style.display = 'block';
    document.getElementById('interestRate').textContent = formatPercentage(interestRate);
    document.getElementById('totalLoan').textContent = formatCurrency(totalLoan);
    document.getElementById('annualLoanCost').textContent = formatCurrency(annualLoanCost);
    document.getElementById('collateralRequired').textContent = formatCurrency(portfolioRequired);
    document.getElementById('quarterlyCashFlow').textContent = formatCurrency(annualCashFlow);
    document.getElementById('mortgagePart').textContent = formatCurrency(mortgagePart);
    document.getElementById('lombardPart').textContent = formatCurrency(lombardPart);

    const affordabilityElement = document.querySelector('.affordability-result');
    affordabilityElement.style.display = 'block';
    document.getElementById('affordability').textContent = isAffordable 
        ? `Yes, annual cost is ${formatPercentage(affordabilityRatio)}% of annual revenue`
        : `No, annual cost is ${formatPercentage(affordabilityRatio)}% of annual revenue`;
  }
});

function parseFormattedNumber(value) {
  if (!value) return 0;
  return Number(value.toString().replace(/[^\d.-]/g, ''));
}

function formatCurrency(value) {
  if (!value && value !== 0) return '€0';
  return `€${value.toLocaleString('fr-FR')}`;
}

function formatPercentage(value) {
  if (!value && value !== 0) return '0%';
  return `${(value * 100).toFixed(2)}`;
}
