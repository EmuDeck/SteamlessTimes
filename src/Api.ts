import {ServerAPI, ServerResponse} from "decky-frontend-lib";
import {PlayTimes, ResetPlaytimeParams} from "./Interfaces";

export function updatePlaytimes(serverAPI: ServerAPI)
{
	serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
	{
		if (response.success)
		{
			console.log("Emutimes playtimes", response.result);
			let to_remove: string[] = []
			Object.entries(response.result).forEach(([key, value]) =>
			{
				let overview = appStore.GetAppOverviewByGameID(key)
				if (overview)
				{
					overview.minutes_playtime_forever = (value / 60.0).toFixed(1);
					console.log("Emutimes", key, "played for", value, "seconds");
				}
				else
				{
					to_remove.push(key)
				}
			});
			to_remove.forEach(value =>
			{
				serverAPI.callPluginMethod<ResetPlaytimeParams, {}>("reset_playtime", {game_id: value}).then(() => {})
			})
		}
	});
}