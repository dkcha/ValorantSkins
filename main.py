from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)
# data is now dict with gunGroup -> composite key (skinName, uuid) sorted by skinName -> skin data
data = {}
uuid = {}

"""
    TODO
    - change index.html to be formatted like Valorant-style, grid and in its order
    - search bar
    - sort the skins alphabetically
    - highlight selected in horizontal list **
    - fix Random Favorite Skin (maybe delete it) **
    - maybe take out name in horizontal list to just show icon
    - certain skins (Game Over Sheriff) doesn't have displayIcon/fullRender but only within
        its nested chroma/levels. Need to find a workaround to display the skin in this case.
        Should only use {gunType}_dark only if there is no image mapped to the given skin.
"""

# make API request to load skin data from valorant-api and populate data {} with values
def load_skins():
    url = 'https://valorant-api.com/v1/weapons/skins'
    response = requests.get(url)
    if response.status_code == 200:
        print('Successful API request to valorant-api')
        for obj in response.json()['data']:
            gun_group = find_gun_group(obj['assetPath'])
            if gun_group not in data:
                data[gun_group] = {}

            # Filter out 'Random Favorite Skin'
            if (obj['displayName'] == 'Random Favorite Skin'):
                continue

            # Initialize the nested dictionaries, data{} holds data by gun groups and uuid is at a flat level for each uuid
            data[gun_group][obj['uuid']] = {}  
            uuid[obj['uuid']] = {}
            for field in obj:
                data[gun_group][obj['uuid']][field] = obj[field]
                uuid[obj['uuid']][field] = obj[field]
                
    else:
        print('Failed API request to valorant-api')

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

# Load skins when the application starts
load_skins()

@app.route('/')
def index():
    # Serve the main HTML page
    #print('routed through /')
    return render_template('index.html')

@app.route('/api/skins')
def get_skins():
   #print('routed through /api/skins')
    return jsonify(data)

@app.route('/api/gun/skins/<string:gun_type>')
def get_skins_by_gun_type(gun_type):
    #print('routed through /api/gun/skins/<string:gun_type>')
    return jsonify(data.get(gun_type, {'error': 'Gun type not found'}))

# todo: group skins by category or gun type
@app.route('/api/gun/<string:uuid>')
def get_skin_by_uuid(uuid):
    #print('routed through /api/gun/<string::uuid>')
    return uuid[uuid]

@app.route('/gun.html')
def gun_page():
    #print('routed through /gun.html')
    return render_template('gun.html')

@app.route('/gun')
def gun_page_with_type():
    #print('routed through /gun')
    return render_template('gun.html')

if __name__ == '__main__':
    app.run(debug=True)