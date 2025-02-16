'use strict'


const {db, models: {User, Ingredient, Pantry, Recipe, PantryItem} } = require('../server/db')
const {ingredientData} = require('./seedData')

/**
 * seed - this function clears the database, updates tables to
 *      match the models, and populates the database.
 */
async function seed() {
  await db.sync({ force: true }) // clears db and matches models to tables
  console.log('db synced!')

  // Creating Users
  const users = await Promise.all([
    User.create({ username: 'Cody', password: '123', email: 'cody@gmail.com', isAdmin: false }),
    User.create({ username: 'Murphy', password: '123', email: 'murphy@gmail.com', isAdmin: false }),
    User.create({ username: 'Admin', password: '123', email: 'admin@gmail.com', isAdmin: true }),
  ])

  // Creating extra pantries
  const pantries = [];
  users.forEach(async (user) => {
    pantries.push(await Pantry.findByPk(user.currentlySelectedPantryId));
    if (user.isAdmin === false){
      for(let i = 1; i < 4; i++){
        pantries.push(await Pantry.create({ name: `Extra Pantry ${i}`, userId: user.id}));
      }
    }
  })

  // Creating Recipes (dummy data)
  const recipes = await Promise.all([
    Recipe.create({ userId: 1, title: "Cinnamon Tea", cuisine: "American", prepTime: "15 mins", cookTime: "Overnight", ingredients: "Green tea bags (2), Black tea bags (2), Cinnamon sticks (3), Lemon slices, Lime slices, Honey, Brown Sugar", instructions: "Add tea, cinnamon, lemon and lime to water and let simmer for 1 hour. Turn off heat and let sit overnight. Add honey and brown sugar to taste. Strain ingredients and serve cold.", createdByUser: true }),
    Recipe.create({ userId: 2, title: "Cinnamon Tea", cuisine: "American", prepTime: "15 mins", cookTime: "Overnight", ingredients: "Green tea bags (2), Black tea bags (2), Cinnamon sticks (3), Lemon slices, Lime slices, Honey, Brown Sugar", instructions: "Add tea, cinnamon, lemon and lime to water and let simmer for 1 hour. Turn off heat and let sit overnight. Add honey and brown sugar to taste. Strain ingredients and serve cold.", createdByUser: true }),
    Recipe.create({ userId: 3, title: "Cinnamon Tea", cuisine: "American", prepTime: "15 mins", cookTime: "Overnight", ingredients: "Green tea bags (2), Black tea bags (2), Cinnamon sticks (3), Lemon slices, Lime slices, Honey, Brown Sugar", instructions: "Add tea, cinnamon, lemon and lime to water and let simmer for 1 hour. Turn off heat and let sit overnight. Add honey and brown sugar to taste. Strain ingredients and serve cold.", createdByUser: true }),
  ]);

 
  // Creating Ingredients
  await Ingredient.bulkCreate(ingredientData, {individualHooks: true}).then(console.log(`******** ${ingredientData.length} ingredients seeded ********`));
  const ingredients = await Ingredient.findAll();

  //Seeding random ingredients into the pantries
  const NUMBER_OF_INGREDIENTS = 50;
  for(let i = 0; i < pantries.length; i++){
    for(let j = 0; j < NUMBER_OF_INGREDIENTS; j++){
      await pantries[i].addIngredient(ingredients[Math.floor(Math.random() * ingredients.length)]);
    }
  }

    


  console.log(`seeded ${users.length} users`)
  console.log(`seeded successfully`)
  return {
    users: {
      cody: users[0],
      murphy: users[1]
    }
  }
}

/*
 We've separated the `seed` function from the `runSeed` function.
 This way we can isolate the error handling and exit trapping.
 The `seed` function is concerned only with modifying the database.
*/
async function runSeed() {
  console.log('seeding...')
  try {
    await seed()
  } catch (err) {
    console.error(err)
    process.exitCode = 1
  } finally {
    console.log('closing db connection')
    await db.close()
    console.log('db connection closed')
  }
}

/*
  Execute the `seed` function, IF we ran this module directly (`node seed`).
  `Async` functions always return a promise, so we can use `catch` to handle
  any errors that might occur inside of `seed`.
*/
if (module === require.main) {
  runSeed()
}

// we export the seed function for testing purposes (see `./seed.spec.js`)
module.exports = seed
