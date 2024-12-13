Please create a Meteor.js project with the following files and code structure:

- The page should replicate the look & feel of https://amberlakepartners.com/ but will focus on a financing simulation form. 
- The interface should be bilingual (English/French) with a toggle (e.g., a dropdown) to switch the UI language. 
- By default, start with English. When the user switches to French, all labels, headings, disclaimers, and button texts should change accordingly. 
- The form fields: 
  1. Purchase price of property (including acquisition costs)
  2. EURIBOR 3M (auto-populated with a default value, in a real scenario fetched from live data)
  3. Bank margin (default 0.60%)
  4. Loan-to-value (property) default 60%
  5. Loan-to-value (portfolio) default 60%
  6. Portfolio yield default 6% p.a.
  7. Annual revenue of the borrower
  8. Email field to send results by email
- After clicking "Calculate", display:
  - Costs of the loan per annum (EURIBOR 3m + bank margin)
  - Amount to place in collateral (always at least 50% of the loan amount +10% margin = 60% total)
  - Take into account management fee 1%, custody fee 0.25% p.a. on the portfolio, subtract from yield.
  - Calculate quarterly cash flow from portfolio
  - Check affordability: cost of loan <= 35% of annual revenue
  - Show split: Mortgage part (60% of property) and Lombard part (guaranteed by portfolio)
- Send the result by email to the user and to mf@amberlakepartners.com
- Add disclaimers that it is indicative
- Provide English and French translations for all labels, headings, disclaimers, and buttons.
- The styling should be roughly inspired by the Amberlake Partners site but adapted for this simple page.
- Provide full code for:
  - client/main.html
  - client/main.js
  - client/styles.css
  - server/main.js

Use the following English/French texts:

English version:
- Title: "Prime Real Estate Financing Calculator"
- Labels:
  - Purchase Price (including acquisition costs)
  - EURIBOR 3M
  - Bank Margin (%)
  - Loan To Value (Property) (%)
  - Loan To Value (Portfolio) (%)
  - Investment Portfolio Yield (% p.a.)
  - Annual Revenue of Borrower
  - Email to receive the simulation
  - Button: "Calculate"
- Results Headline: "Results (Indicative):"
- Fields in results:
  - Interest Rate (Annual):
  - Total Loan Amount:
  - Annual Loan Cost (Interest):
  - Collateral Required:
  - Quarterly Net Cash Flow from Portfolio:
  - Affordability (Cost vs. 35% of Revenues):
  - Mortgage Part (60% of Property Value):
  - Lombard Part (Guaranteed by Portfolio):
- Affordability Check Text:
  - If affordable: "Yes, annual cost is within 35% of annual revenue."
  - If not: "No, annual cost exceeds 35% of annual revenue."
- Disclaimer: "These calculations are indicative and do not constitute any form of advice or commitment."
- Language toggle label: "Language" -> English or French

French version:
- Title: "Calculateur de Financement Immobilier Prime"
- Labels:
  - Prix d'achat (frais inclus)
  - EURIBOR 3M
  - Marge Bancaire (%)
  - Loan To Value (Propriété) (%)
  - Loan To Value (Portefeuille) (%)
  - Rendement du Portefeuille d'Investissement (% p.a.)
  - Revenu Annuel de l'Emprunteur
  - Email pour recevoir la simulation
  - Button: "Calculer"
- Results Headline: "Résultats (Indicatifs) :"
- Fields in results:
  - Taux d'Intérêt (Annuel):
  - Montant Total du Prêt:
  - Coût Annuel du Prêt (Intérêts):
  - Garantie Demandée:
  - Flux de Trésorerie Trimestriel Net du Portefeuille:
  - Accessibilité (Coût vs. 35% des Revenus):
  - Part Hypothécaire (60% de la Valeur du Bien):
  - Partie Lombard (Garantie par le Portefeuille):
- Affordability Check Text:
  - If affordable: "Oui, le coût annuel est inférieur à 35% du revenu annuel."
  - If not: "Non, le coût annuel dépasse 35% du revenu annuel."
- Disclaimer: "Ces calculs sont fournis à titre indicatif et ne constituent ni un conseil ni un engagement."
- Language toggle label: "Langue" -> Anglais ou Français

Make sure all text updates dynamically when the language is changed.

After implementing the code, provide the full code in a single response:
- Include comments at the top of each file with instructions.
- Include `console.log()` statements where relevant.
- Ensure no apologetic language is used.