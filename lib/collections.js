import { Mongo } from 'meteor/mongo';

// Create a collection to store the EURIBOR rate
export const EuriborRates = new Mongo.Collection('euribor_rates'); 