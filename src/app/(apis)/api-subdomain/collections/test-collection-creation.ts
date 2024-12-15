/* eslint-disable unicorn/prefer-top-level-await */

async function testCollectionCreation() {
  const validCollection = {
    supply: 100,
    slug: 'test-collection-2',
    name: 'Test Collection',
    description: 'A adadadad test collection2 collection for validation',
    logo: 'https://example.com/logo.png',
    banner: 'https://example.com/banner.png',
    links: ['https://twitter.com/test', 'https://discord.gg/test'],
    team: ['0xA20C07F94A127fD76E61fbeA1019cCe759225002', 'vitalik.eth'],
    royalties: {},
    verified: false,
  };

  const invalidCollection = {
    supply: -1, // should fail
    slug: 'test!', // invalid chars
    name: '', // empty
    description: 'Test',
    logo: 'not-a-url',
    team: ['not-an-address'],
  };

  try {
    // Test valid collection
    const validResponse = await fetch('http://localhost:3000/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validCollection),
    });
    console.log('Valid collection response:', await validResponse.json());

    // Test invalid collection
    const invalidResponse = await fetch('http://localhost:3000/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidCollection),
    });
    console.log('Invalid collection response:', await invalidResponse.json());
  } catch (err) {
    console.error('Error:', err);
  }
}

testCollectionCreation();
