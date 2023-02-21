import {debounce} from "lodash-es";
import {PlayTimes} from "./Interfaces";
import {ServerAPI, ServerResponse} from "decky-frontend-lib";
import Logger from "./logger";
import {AppOverview} from "./SteamClient";

export const updatePlaytimesThrottled = debounce((serverAPI: ServerAPI) => updatePlaytimes(serverAPI), 1000, {leading: true});
export const updatePlaytimeThrottled = debounce((serverAPI: ServerAPI, gameId: string, overview: AppOverview) => updatePlaytime(serverAPI, gameId, overview), 1000, {leading: true});

export function updatePlaytimes(serverAPI: ServerAPI)
{
	const logger = new Logger("Playtimes");
	serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
	{
		if (response.success)
		{
			logger.log("playtimes", response.result);
			Object.entries(response.result).forEach(([key, value]) =>
			{
				try
				{
					let overview = appStore.GetAppOverviewByGameID(key)
					if (overview)
					{
						overview.minutes_playtime_forever = (value / 60.0).toFixed(1);
						logger.log(key, "played for", value, "seconds");
					}
				}
				catch (e)
				{
					logger.error(e)
				}
			});
		}
	});
}

export function updatePlaytime(serverAPI: ServerAPI, gameId: string, overview: AppOverview)
{
	const logger = new Logger("Playtimes");
	serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
	{
		if (response.success)
		{
			logger.log("playtimes", response.result);
			const value = response.result[gameId]
			try
			{
				if (overview && value)
				{
					overview.minutes_playtime_forever = (value / 60.0).toFixed(1);
					logger.log(gameId, "played for", value, "seconds");
				}
			}
			catch (e)
			{
				logger.error(e)
			}
		}
	});
}