import {Component} from "react";
import {AppProps, AppState, PlayTimes} from "./Interfaces";
import {ButtonItem, PanelSection, PanelSectionRow, ServerResponse} from "decky-frontend-lib";

export class App extends Component<AppProps, AppState>
{
	state: Readonly<AppState> = {
		play_times: {}
	}

	loadState()
	{
		this.props.serverAPI.callPluginMethod<{}, PlayTimes>("get_playtimes", {}).then((response: ServerResponse<PlayTimes>) =>
		{
			if (response.success)
			{
				this.setState({
					play_times: response.result
				});
			}
		});
	}

	componentDidMount()
	{
		this.loadState()
	}

	render()
	{
		return (
			<PanelSection title="Reset Play Time">
				{
					Object.entries(this.state.play_times).map(([key, value]) =>
					{
						return (
							<PanelSectionRow>
								<ButtonItem onClick={() => {
									this.props.serverAPI.callPluginMethod<{game_id: string}, {}>("reset_playtime", {game_id: key}).then(() =>
									{
										this.loadState();
										console.log("Emutimes reset", key, "previous time", value, "seconds")
										appStore.GetAppOverviewByGameID(key).minutes_playtime_forever = "0";
									})
								}}>
									Reset {appStore.GetAppOverviewByGameID(key).display_name}: {(+(value / 60.0).toFixed(1) < 60.0) ? (value / 60.0).toFixed(1) + " Minutes" : ((value / 60.0) / 60.0).toFixed(1) + " Hours"}
								</ButtonItem>
							</PanelSectionRow>
						);

					})
				}
			</PanelSection>
		);
	}
}