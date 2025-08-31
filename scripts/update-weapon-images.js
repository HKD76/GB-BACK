const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "gb_project";

const imageUrls = require("../json/arm_image_urls_wiki.json");

/**
 * Met à jour les images des armes dans la base de données
 */
async function updateWeaponImages() {
  let client;

  try {
    console.log("🔗 Connexion à MongoDB...");
    client = new MongoClient(mongoUrl);
    await client.connect();

    const db = client.db(dbName);
    const weaponsCollection = db.collection("weapons");

    console.log("📊 Récupération de toutes les armes...");
    const weapons = await weaponsCollection.find({}).toArray();

    console.log(`📋 ${weapons.length} armes trouvées dans la base de données`);
    console.log(
      `🖼️  URLs d'images disponibles: ${Object.keys(imageUrls).length}`
    );

    let updatedCount = 0;
    let notFoundCount = 0;
    let noIdCount = 0;

    for (const weapon of weapons) {
      if (!weapon.id) {
        noIdCount++;
        continue;
      }

      const weaponId = weapon.id.toString();

      if (imageUrls[weaponId]) {
        const imageUrl = imageUrls[weaponId];

        await weaponsCollection.updateOne(
          { _id: weapon._id },
          {
            $set: {
              img_full: imageUrl,
              updated_at: new Date(),
            },
          }
        );

        updatedCount++;
        console.log(
          `✅ Arme "${weapon.name}" (ID: ${weaponId}) mise à jour avec l'image: ${imageUrl}`
        );
      } else {
        notFoundCount++;
        console.log(
          `❌ Aucune image trouvée pour l'arme "${weapon.name}" (ID: ${weaponId})`
        );
      }
    }

    console.log("\n📈 Résumé de la mise à jour:");
    console.log(`✅ Armes mises à jour: ${updatedCount}`);
    console.log(`❌ Armes sans image trouvée: ${notFoundCount}`);
    console.log(`⚠️  Armes sans ID: ${noIdCount}`);
    console.log(`📊 Total des armes traitées: ${weapons.length}`);

    if (updatedCount > 0) {
      console.log("\n🎉 Mise à jour terminée avec succès!");
    } else {
      console.log("\n⚠️  Aucune arme n'a été mise à jour.");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des images:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Connexion MongoDB fermée");
    }
  }
}

/**
 * Affiche des exemples d'URLs d'images
 */
function showImageUrlExamples() {
  console.log("🖼️  Exemples d'URLs d'images disponibles:");
  const examples = Object.entries(imageUrls).slice(0, 5);

  examples.forEach(([id, url]) => {
    console.log(`  ID ${id}: ${url}`);
  });

  console.log(`\n📊 Total: ${Object.keys(imageUrls).length} URLs d'images`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log("🚀 Démarrage de la mise à jour des images d'armes...");

  showImageUrlExamples();
  console.log("\n" + "=".repeat(50) + "\n");

  await updateWeaponImages();
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateWeaponImages, showImageUrlExamples };
