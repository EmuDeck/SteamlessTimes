import {afterPatch, ServerAPI, ServerResponse} from "decky-frontend-lib";
import {ReactElement} from "react";
import {PlayTimes} from "./Interfaces";
import {AppOverview} from "./SteamClient";

export const patchAppPage = (serverAPI: ServerAPI) => {
	// @ts-ignore
	return serverAPI.routerHook.addPatch("/library/app/:appid", (props: { path: string, children: ReactElement}) =>
	{
		afterPatch(
				props.children.props,
				"renderFunc",
				(_, ret) =>
				{
					const overview: AppOverview = ret.props.children.props.overview;
					const game_id: string = ret.props.children.props.overview.m_gameid;
					// console.log(game_id);
					if (overview.app_type==1073741824)
					{
						serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
						{
							if (response.success)
							{
								// console.log(response.result)
								if (response.result[game_id])
								{
									ret.props.children.props.details.nPlaytimeForever = +(response.result[game_id] / 60.0).toFixed(1);
									console.log(+(response.result[game_id] / 60.0).toFixed(1));
								}
							}
						});
					}
					return ret;
				}
		)
		return props;
	});
}


