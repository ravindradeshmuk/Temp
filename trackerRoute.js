const express = require('express');
const TrackerConfig = require('../models/TrackerConfig');
const HeadingAccess = require('../models/HeadingAccess'); 
const User = require('../models/User');// Ensure correct path to model
const router = express.Router();

// POST /api/trackerConfig - Add or update tracker headings
router.post('/', async (req, res) => {
  const { product, headings } = req.body;

  try {
    let trackerConfig = await TrackerConfig.findOne({ product });

    if (trackerConfig) {
      // Update existing document
      trackerConfig.headings = Array.from(new Set([...trackerConfig.headings, ...headings]));
    } else {
      // Create new document
      trackerConfig = new TrackerConfig({ product, headings });
    }

    await trackerConfig.save();
    res.status(200).json(trackerConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/trackerConfig/:product - Update tracker headings
router.put('/:product', async (req, res) => {
  const { product } = req.params;
  const { headings } = req.body;

  try {
    const trackerConfig = await TrackerConfig.findOneAndUpdate(
      { product },
      { headings },
      { new: true, upsert: true }
    );
    res.status(200).json(trackerConfig);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/trackerConfig/delete-heading - Delete a specific heading
router.post('/delete-heading', async (req, res) => {
  const { product, heading } = req.body;

  try {
    let trackerConfig = await TrackerConfig.findOne({ product });

    if (trackerConfig) {
      trackerConfig.headings = trackerConfig.headings.filter(h => h !== heading);
      await trackerConfig.save();
      res.status(200).json(trackerConfig);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/trackerConfig/edit-heading - Edit a specific heading
router.post('/edit-heading', async (req, res) => {
  const { product, oldHeading, newHeading } = req.body;

  try {
    let trackerConfig = await TrackerConfig.findOne({ product });

    if (trackerConfig) {
      trackerConfig.headings = trackerConfig.headings.map(h => h === oldHeading ? newHeading : h);
      await trackerConfig.save();
      res.status(200).json(trackerConfig);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status500.json({ message: error.message });
  }
});

// GET /api/trackerConfig/:product - Get tracker configuration by product
router.get('/:product', async (req, res) => {
  try {
    const trackerConfig = await TrackerConfig.findOne({ product: req.params.product });
    if (!trackerConfig) return res.status(404).json({ error: 'TrackerConfig not found' });

    res.json(trackerConfig);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/trackerConfig/:product - Get tracker configuration by product
router.get('/:product', async (req, res) => {
  try {
    const config = await TrackerConfig.findOne({ product: req.params.product });
    if (!config) return res.status(404).json({ message: 'Configuration not found' });
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get heading access for a product
router.get('/headingAccess/:product', async (req, res) => {
  try {
    const access = await HeadingAccess.find({ product: req.params.product });
    res.json(access);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Set heading access for a product
router.post('/headingAccess', async (req, res) => {
  const { product, heading, teamWriteAccess } = req.body;
  try {
    const access = new HeadingAccess({ product, heading, teamWriteAccess });
    await access.save();
    res.json(access);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Update heading access for a product
router.put('/headingAccess/:id', async (req, res) => {
  try {
    const access = await HeadingAccess.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(access);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Delete heading access for a product
router.delete('/headingAccess/:id', async (req, res) => {
  try {
    await HeadingAccess.findByIdAndDelete(req.params.id);
    res.send('Access deleted');
  } catch (error) {
    res.status(500).send('Server error');
  }
});

router.get('/api/preference/product', async (req, res) => {
  try {
    const users = await User.find({}, 'preference'); // Only fetch the preference field
    const products = [];

    users.forEach(user => {
      user.preference.forEach(pref => {
        if (!products.includes(pref.product)) {
          products.push(pref.product);
        }
      });
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/api/trackerConfig', async (req, res) => {
  try {
    const trackerConfigs = await TrackerConfig.find({});
    const products = trackerConfigs.map(config => config.product);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// router.get('/change-view-data', async (req, res) => {
//   try {
//     const trackerConfigs = await TrackerConfig.find({});
//     const products = trackerConfigs.map(config => config.product);
//     res.status(200).json(products);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get('/change-view-data/:product', async (req, res) => {
  try {
    const product = req.params.product;
    const trackerConfig = await TrackerConfig.findOne({ product });
    if (trackerConfig) {
      res.status(200).json({ headings: trackerConfig.headings });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router.get('/api/userdata/:email/:product', async (req, res) => {
//   const { email, product } = req.params;

//   try {
//     const user = await User.findOne({ email }).lean().exec();
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     console.log('User data:', user); // Debug log

//     const trackerConfig = await TrackerConfig.findOne({ product }).lean().exec();
//     if (!trackerConfig) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     console.log('TrackerConfig:', trackerConfig); // Debug log

//     const allHeadings = trackerConfig.headings || [];

//     const userPreference = await User.findOne({ userId: user._id, product }).lean().exec();
//     const selectedHeadings = userPreference ? userPreference.headings : allHeadings;

//     console.log('Selected headings:', selectedHeadings); // Debug log

//     res.json({ allHeadings, selectedHeadings });
//   } catch (error) {
//     console.error('Error fetching user data or preferences:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
router.get('/api/userdata/:email/:product', async (req, res) => {
  const { email, product } = req.params;

  try {
    const user = await User.findOne({ email }).lean().exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const trackerConfig = await TrackerConfig.findOne({ product }).lean().exec();
    if (!trackerConfig) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const allHeadings = trackerConfig.headings || [];
    const selectedHeadings = user.preferences && user.preferences[product] ? user.preferences[product] : [];

    res.json({ userId: user._id, allHeadings, selectedHeadings });
  } catch (error) {
    console.error('Error fetching user data or preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.put('/api/userdata/update-preferences', async (req, res) => {
  const { userId, selectedHeadings, product } = req.body;
  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const trackerConfig = await TrackerConfig.findOne({ product }).lean().exec();
    if (!trackerConfig) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const validHeadings = selectedHeadings.filter(heading => trackerConfig.headings.includes(heading));

    if (!user.preferences) {
      user.preferences = {};
    }

    user.preferences[product] = validHeadings;

    await user.save();
    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update headings for a specific product in user preferences
// router.put('/api/userdata/update-preferences', async (req, res) => {
//   const { email, selectedHeadings, product } = req.body;
//   try {
//     // Find the user by email
//     const user = await User.findOne({ email }).exec();
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Find the TrackerConfig for the product
//     const trackerConfig = await TrackerConfig.findOne({ product }).lean().exec();
//     if (!trackerConfig) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     // Ensure that only valid headings are saved
//     const validHeadings = selectedHeadings.filter(heading => trackerConfig.headings.includes(heading));

//     // Update the user's preferences
//     if (!user.preferences) {
//       user.preferences = {};
//     }

//     // Set the preferences for this product
//     user.preferences[product] = validHeadings;

//     await user.save();
//     res.json({ message: 'Preferences updated successfully' });
//   } catch (error) {
//     console.error('Error updating user preferences:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


router.get('/api/preferences', async (req, res) => {
  try {
    const trackerConfigs = await TrackerConfig.find({});
    const preferences = trackerConfigs.map(config => ({
      product: config.product,
      headings: config.headings
    }));
    res.status(200).json(preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
