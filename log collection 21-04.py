from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import time
from pymongo import MongoClient
import datetime

# MongoDB connection configuration
mongo_config = {
    'username': 'smeetpatel20',
    'password': 'Smeet2002',
    'cluster_uri': 'mongodb+srv://smeetpatel20:Smeet%4001@demo.15p8pdy.mongodb.net/',
    'database': 'AnamolyDetct',
    'collection': 'log_data'
}

# MongoDB connection
mongo_client = MongoClient(mongo_config['cluster_uri'], username=mongo_config['username'], password=mongo_config['password'])
db = mongo_client[mongo_config['database']]
collection = db[mongo_config['collection']]

# Specify the path to Chromedriver
chromedriver_path = "C:/Users/91955/Desktop/G-18/New folder/chromedriver-win64/chromedriver.exe"

# Create a Service object
service = Service(executable_path=chromedriver_path)

# Launch browser with Service object
driver = webdriver.Chrome(service=service)

# Load HTML page
driver.get("https://www.google.com/")

# Continuously monitor console logs
while True:
    # Capture logs (e.g., console messages, network requests)
    logs = driver.get_log('browser')

    # Insert logs into MongoDB Atlas collection with label
    for log in logs:
        if log['level'] == 'SEVERE':
            label = 1
        elif log['level'] == 'WARNING':
            label = 0

             # Map level values
        level = 'NORMAL'
        if log['level'] == 'SEVERE':
            level = 'ANOMALY'
        elif log['level'] == 'WARNING':
            level = 'NORMAL'

        timestamp = datetime.datetime.fromtimestamp(log['timestamp'] / 1000.0).strftime('%Y-%m-%d %H:%M:%S')
        log_data = {
            'level': level,
            'message': log['message'],
            'source': log['source'],
            'timestamp': timestamp,
            'label': label
        }

        
        collection.insert_one(log_data)

    # Wait for some time before capturing logs again
    time.sleep(10)
