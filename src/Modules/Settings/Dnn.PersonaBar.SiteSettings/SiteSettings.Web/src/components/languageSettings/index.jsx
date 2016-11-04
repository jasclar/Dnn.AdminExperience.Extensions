import React, { Component, PropTypes } from "react";
import { connect } from "react-redux";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
    pagination as PaginationActions,
    siteSettings as SiteSettingsActions
} from "../../actions";
import InputGroup from "dnn-input-group";
import Languages from "./languages";
import SingleLineInputWithError from "dnn-single-line-input-with-error";
import MultiLineInput from "dnn-multi-line-input";
import Grid from "dnn-grid-system";
import Dropdown from "dnn-dropdown";
import RadioButtons from "dnn-radio-buttons";
import Switch from "dnn-switch";
import Label from "dnn-label";
import Button from "dnn-button";
import "./style.less";
import util from "../../utils";
import resx from "../../resources";
import styles from "./style.less";

class LanguageSettingsPanelBody extends Component {
    constructor() {
        super();
        this.state = {
            languageSettings: undefined
        };
    }

    componentWillMount() {
        const {state, props} = this;
        if (props.languageSettings) {
            this.setState({
                languageSettings: props.languageSettings
            });
            return;
        }
        props.dispatch(SiteSettingsActions.getLanguageSettings(props.portalId, (data) => {
            this.setState({
                languageSettings: Object.assign({}, data.Settings)
            });
        }));
    }

    componentWillReceiveProps(props) {
        let {state} = this;

        this.setState({
            languageSettings: Object.assign({}, props.languageSettings)
        });
    }

    onSettingChange(key, event) {
        let {state, props} = this;
        let languageSettings = Object.assign({}, state.languageSettings);

        if (key === "LanguageDisplayMode") {
            languageSettings[key] = event;
        }
        else if (key === "SiteDefaultLanguage") {
            languageSettings[key] = event.value;
        }
        else {
            languageSettings[key] = typeof (event) === "object" ? event.target.value : event;
        }

        this.setState({
            languageSettings: languageSettings
        });

        props.dispatch(SiteSettingsActions.languageSettingsClientModified(languageSettings));
    }

    onUpdate(event) {
        event.preventDefault();
        const {props, state} = this;

        props.dispatch(SiteSettingsActions.updateLanguageSettings(state.languageSettings, (data) => {
            util.utilities.notify(resx.get("SettingsUpdateSuccess"));
        }, (error) => {
            util.utilities.notifyError(resx.get("SettingsError"));
        }));
    }

    onCancel(event) {
        const {props, state} = this;
        util.utilities.confirm(resx.get("SettingsRestoreWarning"), resx.get("Yes"), resx.get("No"), () => {
            props.dispatch(SiteSettingsActions.getLanguageSettings(props.portalId, (data) => {
                this.setState({
                    languageSettings: Object.assign({}, data.Settings)
                });
            }));
        });
    }

    getLanguageOptions() {
        const {props, state} = this;
        let options = [];
        if (props.languages !== undefined) {
            options = props.languages.map((item) => {
                if (state.languageSettings.LanguageDisplayMode === "NATIVE") {
                    return { label: item.NativeName, value: item.Name };
                }
                else {
                    return { label: item.EnglishName, value: item.Name };
                }
            });
        }
        return options;
    }

    getLanguageDisplayModes() {
        const {props} = this;
        let options = [];
        if (props.languageDisplayModes !== undefined) {
            options = props.languageDisplayModes.map((item) => {
                return { label: item.Key, value: item.Value };
            });
        }
        return options;
    }

    /* eslint-disable react/no-danger */
    render() {
        const {props, state} = this;
        if (state.languageSettings) {
            const columnOne = <div className="left-column">
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("systemDefaultLabel.Help")}
                        label={resx.get("systemDefaultLabel")}
                        />
                    <SingleLineInputWithError
                        inputStyle={{ margin: "0" }}
                        withLabel={false}
                        error={false}
                        value={state.languageSettings.SystemDefaultLanguage}
                        enabled={false}
                        />
                </InputGroup>
                <InputGroup>
                    <Label
                        tooltipMessage={resx.get("siteDefaultLabel.Help")}
                        label={resx.get("siteDefaultLabel")}
                        />
                    <Dropdown
                        options={this.getLanguageOptions()}
                        value={state.languageSettings.SiteDefaultLanguage}
                        onSelect={this.onSettingChange.bind(this, "SiteDefaultLanguage")}
                        enabled={!state.languageSettings.ContentLocalizationEnabled}
                        />
                    <RadioButtons
                        onChange={this.onSettingChange.bind(this, "LanguageDisplayMode")}
                        options={this.getLanguageDisplayModes()}
                        buttonGroup="languageDisplayMode"
                        value={state.languageSettings.LanguageDisplayMode}                        
                        />
                </InputGroup>
            </div>;
            const columnTwo = <div className="right-column">
                <InputGroup>
                    <div className="languageSettings-row_switch">
                        <Label
                            labelType="inline"
                            tooltipMessage={resx.get("plUrl.Help")}
                            label={resx.get("plUrl")}
                            />
                        <Switch
                            labelHidden={true}
                            value={state.languageSettings.EnableUrlLanguage}
                            onChange={this.onSettingChange.bind(this, "EnableUrlLanguage")}
                            readOnly={state.languageSettings.ContentLocalizationEnabled}
                            />
                    </div>
                </InputGroup>
                <InputGroup>
                    <div className="languageSettings-row_switch">
                        <Label
                            labelType="inline"
                            tooltipMessage={resx.get("detectBrowserLable.Help")}
                            label={resx.get("detectBrowserLable")}
                            />
                        <Switch
                            labelHidden={true}
                            value={state.languageSettings.EnableBrowserLanguage}
                            onChange={this.onSettingChange.bind(this, "EnableBrowserLanguage")}
                            />
                    </div>
                </InputGroup>
                <InputGroup>
                    <div className="languageSettings-row_switch">
                        <Label
                            labelType="inline"
                            tooltipMessage={resx.get("allowUserCulture.Help")}
                            label={resx.get("allowUserCulture")}
                            />
                        <Switch
                            labelHidden={true}
                            value={state.languageSettings.AllowUserUICulture}
                            onChange={this.onSettingChange.bind(this, "AllowUserUICulture")}
                            />
                    </div>
                </InputGroup>
            </div>;

            return (
                <div className={styles.languageSettings}>
                    <Languages portalId={this.props.portalId} languageDisplayMode={state.languageSettings.LanguageDisplayMode} />
                    <div className="sectionTitle">{resx.get("LanguageSettings")}</div>
                    <Grid children={[columnOne, columnTwo]} numberOfColumns={2} />
                    <div className="buttons-box">
                        <Button
                            disabled={!this.props.languageSettingsClientModified}
                            type="secondary"
                            onClick={this.onCancel.bind(this)}>
                            {resx.get("Cancel")}
                        </Button>
                        <Button
                            disabled={!this.props.languageSettingsClientModified}
                            type="primary"
                            onClick={this.onUpdate.bind(this)}>
                            {resx.get("Save")}
                        </Button>
                    </div>
                </div>
            );
        }
        else return <div />;
    }
}

LanguageSettingsPanelBody.propTypes = {
    dispatch: PropTypes.func.isRequired,
    tabIndex: PropTypes.number,
    languageSettings: PropTypes.object,
    languages: PropTypes.array,
    languageDisplayModes: PropTypes.array,
    languageSettingsClientModified: PropTypes.bool,
    portalId: PropTypes.number
};

function mapStateToProps(state) {
    return {
        tabIndex: state.pagination.tabIndex,
        languageSettings: state.siteSettings.languageSettings,
        languages: state.siteSettings.languages,
        languageDisplayModes: state.siteSettings.languageDisplayModes,
        languageSettingsClientModified: state.siteSettings.languageSettingsClientModified
    };
}

export default connect(mapStateToProps)(LanguageSettingsPanelBody);