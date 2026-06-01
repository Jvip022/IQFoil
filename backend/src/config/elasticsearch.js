const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

let client;

async function connectElasticsearch() {
  try {
    client = new Client({ node: process.env.ELASTICSEARCH_HOST });
    await client.info();
    console.log('✅ Conectado a Elasticsearch');
  } catch (error) {
    console.error('❌ Error conectando a Elasticsearch:', error);
    throw error;
  }
}

function getElasticClient() {
  if (!client) throw new Error('Elasticsearch no conectado');
  return client;
}

async function closeElasticsearch() {
  if (client) await client.close();
}

module.exports = { connectElasticsearch, getElasticClient, closeElasticsearch };
