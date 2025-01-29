from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)
data = {}
uuid = {}

"""
    TODO
    - Group skins by gun ** dict: { 
                                'Stinger': { 
                                    uuid: {
                                        ... 
                                    },
                                    uuid: {
                                        ...
                                    }
                                }
                                
    - Make container bigger for skin to show streamed video
    - Carousel style viewing of available skins per gun group
        - Display image should only show for carousel style
    - Add streamed videos when clicked on / viewed
"""

@app.route('/')
def index():
    # Serve the main HTML page
    return render_template('index.html')

# todo: make this load on web page start, rather than having to navigate to index.html first to load
@app.route('/api/skins')
def get_skins():
    # Fetch data from the external API
    url = 'https://valorant-api.com/v1/weapons/skins'
    response = requests.get(url)
    if response.status_code == 200:
        for obj in response.json()['data']:
            # group by gun type
            gun_group = find_gun_group(obj['assetPath'])
            if gun_group not in data:
                data[gun_group] = {}

            data[gun_group][obj['uuid']] = {}  # Initialize the nested dictionary
            uuid[obj['uuid']] = {}
            for field in obj:
                data[gun_group][obj['uuid']][field] = obj[field]
                uuid[obj['uuid']][field] = obj[field]

        return jsonify(data)
    else:
        return jsonify({'error': 'Failed to fetch data'}), 500
    
@app.route('/api/gun/skins/<string:gun_type>')
def get_skins_by_gun_type(gun_type):
    print('routed through /api/gun/skins/<string:gun_type>')
    return jsonify(data.get(gun_type, {'error': 'Gun type not found'}))

# todo: group skins by category or gun type
@app.route('/api/gun/<string:uuid>')
def get_skin_by_uuid(uuid):
    print('/api/gun/ route')
    return uuid[uuid]

@app.route('/gun.html')
def gun_page():
    return render_template('gun.html')

@app.route('/gun')
def gun_page_with_type():
    return render_template('gun.html')

    
# find gun by group type
def find_gun_group(asset_path):
    gun_groups = group_by_gun()

    for group in gun_groups:
        if group in asset_path:
            return gun_groups[group]
        
    return None

def group_by_gun():
    grouping = {}

    grouping['ShooterGame/Content/Equippables/Guns/Sidearms/BasePistol/'] = 'Classic'
    grouping['ShooterGame/Content/Equippables/Guns/Sidearms/Slim/'] = 'Shorty'
    grouping['ShooterGame/Content/Equippables/Guns/Sidearms/AutoPistol/'] = 'Frenzy'
    grouping['ShooterGame/Content/Equippables/Guns/Sidearms/Luger/'] = 'Ghost'
    grouping['ShooterGame/Content/Equippables/Guns/Sidearms/Revolver/'] = 'Sheriff'
    grouping['ShooterGame/Content/Equippables/Guns/SubMachineGuns/Vector/'] = 'Stinger'
    grouping['ShooterGame/Content/Equippables/Guns/SubMachineGuns/MP5/'] = 'Spectre'
    grouping['ShooterGame/Content/Equippables/Guns/Shotguns/PumpShotgun/'] = 'Bucky'
    grouping['ShooterGame/Content/Equippables/Guns/Shotguns/AutoShotgun/'] = 'Judge'
    grouping['ShooterGame/Content/Equippables/Guns/Rifles/Burst/'] = 'Bulldog'
    grouping['ShooterGame/Content/Equippables/Guns/SniperRifles/DMR/'] = 'Guardian'
    grouping['ShooterGame/Content/Equippables/Guns/Rifles/Carbine/'] = 'Phantom'
    grouping['ShooterGame/Content/Equippables/Guns/Rifles/AK/'] = 'Vandal'
    grouping['ShooterGame/Content/Equippables/Guns/SniperRifles/Leversniper/'] = 'Marshal'
    grouping['ShooterGame/Content/Equippables/Guns/SniperRifles/Doublesniper/'] = 'Outlaw'
    grouping['ShooterGame/Content/Equippables/Guns/SniperRifles/Boltsniper/'] = 'Operator'
    grouping['ShooterGame/Content/Equippables/Guns/HvyMachineGuns/LMG/'] = 'Ares'
    grouping['ShooterGame/Content/Equippables/Guns/HvyMachineGuns/HMG/'] = 'Odin'
    grouping['ShooterGame/Content/Equippables/Melee/'] = 'Melee'

    return grouping
    

if __name__ == '__main__':
    app.run(debug=True)


# # Serialize the `data` dictionary to a JSON string with double quotes
# json_data_with_double_quotes = json.dumps(data, indent=4)

# # Print the JSON string
# #print(json_data_with_double_quotes)
# #print(data)

# # Figure out how frontend really, how to connect images from API response links to populate in HTML
# print(data['e49c0fd2-435c-2c41-9164-4996080f455b'])