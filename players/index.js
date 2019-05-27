function buildPlayerMap(teams) {
        const playerMap = new Map();

        teams.forEach(players => {
            players.forEach(player => {
                if(!playerMap.has(player.name)) {
                    playerMap.set(player.name, [player]);
                } else {
                    playerMap.get(player.name).push(player);
                }
            });
        });
        
        return playerMap;
}

module.exports = buildPlayerMap;