from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)

@app.route('/')
def index():
    # Serve the main HTML page
    return render_template('index.html')

@app.route('/api/skins')
def get_skins():
    # Fetch data from the external API
    url = 'https://valorant-api.com/v1/weapons/skins'
    response = requests.get(url)
    if response.status_code == 200:
        data = {}
        for obj in response.json()['data']:
            data[obj['uuid']] = {field: obj[field] for field in obj}
        return jsonify(data)
    else:
        return jsonify({'error': 'Failed to fetch data'}), 500

if __name__ == '__main__':
    app.run(debug=True)


# # Serialize the `data` dictionary to a JSON string with double quotes
# json_data_with_double_quotes = json.dumps(data, indent=4)

# # Print the JSON string
# #print(json_data_with_double_quotes)
# #print(data)

# # Figure out how frontend really, how to connect images from API response links to populate in HTML
# print(data['e49c0fd2-435c-2c41-9164-4996080f455b'])