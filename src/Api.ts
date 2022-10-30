import {ServerAPI, ServerResponse} from "decky-frontend-lib";
import {PlayTimes} from "./Interfaces";

export function updatePlaytimes(serverAPI: ServerAPI)
{
	serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
	{
		if (response.success)
		{
			console.log("Emutimes playtimes", response.result);
			Object.entries(response.result).forEach(([key, value]) =>
			{
				appStore.GetAppOverviewByGameID(key).minutes_playtime_forever = (value / 60.0).toFixed(1);
				console.log("Emutimes", key, "played for", value, "seconds");
			});
		}
	});
}