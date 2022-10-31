import asyncio
import logging
from typing import Dict

import time

from settings import SettingsManager

logging.basicConfig(filename="/tmp/steamlesstimes.log",
                    format='[SteamlessTimes] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger = logging.getLogger()
logger.setLevel(logging.INFO)  # can be changed to logging.DEBUG for debugging issues


class Game:
    def __init__(self, game_id: str):
        self.game_id = game_id
        self.start_time = time.time()

    def time_since_start(self):
        return time.time() - self.start_time


class Plugin:
    settings: SettingsManager
    playtimes: Dict[str, float] = None
    running_games: Dict[str, Game] = {}
    last_started_game: str = ""

    async def _main(self):
        Plugin.settings = SettingsManager("steamlesstimes")
        await Plugin.read(self)
        Plugin.playtimes = await Plugin.getSetting(self, "playtimes", {})

    async def _unload(self):
        await Plugin.setSetting(self, "playtimes", Plugin.playtimes)

    async def on_lifetime_callback(self, data):
        logger.debug("Handling lifetime notification")
        logger.debug(f"Data: {data}")
        instanceId = data["nInstanceID"]
        appId = data["unAppID"]
        if int(appId) != 0:
            logger.debug(f"Ignoring steam game {appId}")
            return
        if data["bRunning"]:
            if Plugin.last_started_game != "":
                Plugin.running_games[instanceId] = Game(Plugin.last_started_game)
                logger.debug(f"Started playing {Plugin.last_started_game}")
                Plugin.last_started_game = ""
            else:
                logger.warning(f"No last game running, cannot track {instanceId}")
        else:
            if instanceId in Plugin.running_games:
                playtime = Plugin.running_games[instanceId].time_since_start()
                gameId = str(Plugin.running_games[instanceId].game_id)
                del(Plugin.running_games[instanceId])
                if gameId in Plugin.playtimes:
                    Plugin.playtimes[gameId] += playtime
                else:
                    Plugin.playtimes[gameId] = playtime
                logger.debug(f"Played {gameId} for {playtime}s")
                await Plugin.setSetting(self, "playtimes", Plugin.playtimes)
            else:
                logger.warning(f"InstanceID {instanceId} not found in running games")

    async def on_game_start_callback(self, idk: int, game_id: str, action: str):
        logger.debug(f"Handling game start callback {idk} {game_id} {action}")
        Plugin.last_started_game = game_id

    async def get_playtimes(self):
        while Plugin.playtimes is None:
            await asyncio.sleep(0.1)
        return Plugin.playtimes

    async def reset_playtime(self, game_id: str):
        del Plugin.playtimes[game_id]
        await Plugin.setSetting(self, "playtimes", Plugin.playtimes)

    async def read(self):
        Plugin.settings.read()

    async def commit(self):
        Plugin.settings.commit()

    async def getSetting(self, key, default):
        return Plugin.settings.getSetting(key, default)

    async def setSetting(self, key, value):
        Plugin.settings.setSetting(key, value)
