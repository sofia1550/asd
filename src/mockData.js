const faker = require('faker');

const generateMockProducts = (numProducts = 100) => {
  const products = [];
  for (let i = 0; i < numProducts; i++) {
    products.push({
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      code: faker.datatype.uuid(),
      price: parseFloat(faker.commerce.price()),
      stock: faker.datatype.number({ min: 0, max: 100 }),
      category: faker.commerce.department(),
      thumbnails: [faker.image.imageUrl()],
    });
  }
  return products;
};

module.exports = generateMockProducts;
