const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas

let con_str = "mongodb+srv://smeetpatel20:Smeet2002@demo.15p8pdy.mongodb.net/AnamolyDetct"
mongoose.connect(con_str, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {console.log('Connected to MongoDB Atlas')})
.catch(err => console.error('Error connecting to MongoDB Atlas:', err));

// Define log schema
const logSchema = new mongoose.Schema({
  level: String,
  message: String,
  source: String,
  timestamp: String,
  label: Number
}, {collection: "log_data"});

// Create a model for the log data collection
const Log = mongoose.model('log_data', logSchema);

// Middleware
app.use(express.json());
app.use(cors());

// API endpoint to fetch logs
app.get('/logs', async (req, res) => {
  try {
    const logs = await Log.find({}); // Using exec() to ensure the query is executed
    
    console.log('Fetched logs:', logs);
    
    // Check if logs are empty
    if (logs.length === 0) {
      return res.status(404).json({ error: 'No logs found' }); // Respond with 404 status code
    }
    
    // Transform logs into JSON format
    const jsonLogs = logs.map(log => {
      return {
        level: log.level,
        message: log.message,
        source: log.source,
        timestamp: log.timestamp,
        label: log.label
      };
    });
    
    
    return res.json(jsonLogs); // Respond with fetched logs in JSON format
  } catch (err) {
    console.error('Error fetching logs:', err);
    return res.status(500).json({ error: 'Error fetching logs' }); // Respond with 500 status code for internal server error
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
