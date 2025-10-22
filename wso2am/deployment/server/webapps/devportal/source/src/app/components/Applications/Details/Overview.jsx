import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import classNames from 'classnames';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import { FormattedMessage, injectIntl, useIntl } from 'react-intl';
import Loading from 'AppComponents/Base/Loading/Loading';
import API from 'AppData/api';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import {
    Grid, List, ListItem, MenuItem, Paper, TextField,
} from '@mui/material';
import { upperCaseString } from 'AppData/stringFormatter';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import ResetThrottlePolicyDialog from 'AppComponents/Applications/Listing/ResetPolicyDialog';
import Alert from 'AppComponents/Shared/Alert';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';

const PREFIX = 'Overview';

const classes = {
    root: `${PREFIX}-root`,
    table: `${PREFIX}-table`,
    leftCol: `${PREFIX}-leftCol`,
    iconAligner: `${PREFIX}-iconAligner`,
    iconTextWrapper: `${PREFIX}-iconTextWrapper`,
    iconEven: `${PREFIX}-iconEven`,
    iconOdd: `${PREFIX}-iconOdd`,
    heading: `${PREFIX}-heading`,
    emptyBox: `${PREFIX}-emptyBox`,
    summaryRoot: `${PREFIX}-summaryRoot`,
    actionPanel: `${PREFIX}-actionPanel`,
    disabledTier: `${PREFIX}-disabledTier`,
    Paper: `${PREFIX}-Paper`,
    Paper2: `${PREFIX}-Paper2`,
    list: `${PREFIX}-list`,
    urlPaper: `${PREFIX}-urlPaper`,
    input: `${PREFIX}-input`,
    avatar: `${PREFIX}-avatar`,
    iconStyle: `${PREFIX}-iconStyle`,
    infoButton: `${PREFIX}-infoButton`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.root}`]: {
        padding: theme.spacing(3, 2),
        '& td, & th': {
            color: theme.palette.getContrastText(theme.custom.infoBar.background),
        },
        background: theme.custom.infoBar.background,
    },

    [`& .${classes.table}`]: {
        minWidth: '100%',
    },

    [`& .${classes.leftCol}`]: {
        width: 200,
    },

    [`& .${classes.iconAligner}`]: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    [`& .${classes.iconTextWrapper}`]: {
        display: 'inline-block',
        paddingLeft: 20,
    },

    [`& .${classes.iconEven}`]: {
        color: theme.custom.infoBar.iconOddColor,
        width: theme.spacing(3),
    },

    [`& .${classes.iconOdd}`]: {
        color: theme.custom.infoBar.iconOddColor,
        width: theme.spacing(3),
    },

    [`& .${classes.heading}`]: {
        color: theme.palette.getContrastText(theme.palette.background.paper),
        paddingLeft: theme.spacing(1),
    },

    [`& .${classes.emptyBox}`]: {
        background: '#ffffff55',
        color: theme.palette.getContrastText(theme.palette.background.paper),
        border: 'solid 1px #fff',
        padding: theme.spacing(2),
        width: '100%',
    },

    [`& .${classes.summaryRoot}`]: {
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.actionPanel}`]: {
        justifyContent: 'flex-start',
    },

    [`& .${classes.disabledTier}`]: {
        color: '#999999',
        fontWeight: '400',
    },

    [`& .${classes.Paper}`]: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
    },

    [`& .${classes.Paper2}`]: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        height: '80%',
    },

    [`& .${classes.list}`]: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        maxHeight: 175,
    },

    [`& .${classes.urlPaper}`]: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        border: `solid 1px ${theme.palette.grey[300]}`,
        '& .MuiInputBase-root:before,  .MuiInputBase-root:hover': {
            borderBottom: 'none !important',
            color: theme.palette.primary.main,
        },
        '& .MuiSelect-select': {
            color: theme.palette.primary.main,
            paddingLeft: theme.spacing(),
        },
        '& .MuiInputBase-input': {
            color: theme.palette.primary.main,
        },
        '& .material-icons': {
            fontSize: 16,
            color: `${theme.palette.grey[700]} !important`,
        },
        borderRadius: 10,
        marginRight: theme.spacing(),
    },

    [`& .${classes.input}`]: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },

    [`& .${classes.avatar}`]: {
        width: 30,
        height: 30,
        background: 'transparent',
        border: `solid 1px ${theme.palette.grey[300]}`,
    },

    [`& .${classes.iconStyle}`]: {
        cursor: 'pointer',
        margin: '-10px 0',
        padding: '0 0 0 5px',
        '& .material-icons': {
            fontSize: 18,
            color: '#9c9c9c',
        },
    },

    [`& .${classes.infoButton}`]: {
        marginLeft: theme.spacing(1),
        color: theme.palette.grey[600],
    },
}));

/**
 * Render application overview page.
 * @param {JSON} props Props passed down from parent.
 * @returns {JSX} jsx output from render.
 */
function Overview(props) {
    const [application, setApplication] = useState(null);
    const [tierDescription, setTierDescription] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const { match: { params: { applicationId } } } = props;
    const [environment, setEnvironment] = useState(null);
    const [tierDisabled, setTierDisabled] = useState(false);
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [topics, setTopics] = useState(null);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const intl = useIntl();

    useEffect(() => {
        const client = new API();
        // Get application
        const promisedApplication = client.getApplication(applicationId);
        promisedApplication
            .then((response) => {
                const appInner = response.obj;
                setApplication(appInner);
                const promisedTier = client.getTierByName(response.obj.throttlingPolicy, 'application');
                promisedTier.then((tierResponse) => {
                    setTierDescription(tierResponse.obj.description);
                    if (appInner.solaceDeployedEnvironments) {
                        setEnvironment(appInner.solaceDeployedEnvironments[0]);
                        setSelectedProtocol(appInner.solaceDeployedEnvironments[0].solaceURLs[0].protocol);
                        setSelectedEndpoint(appInner.solaceDeployedEnvironments[0].solaceURLs[0].endpointURL);
                        if (appInner.solaceDeployedEnvironments[0].solaceURLs[0].protocol === 'mqtt') {
                            setTopics(appInner.solaceDeployedEnvironments[0].SolaceTopicsObject.mqttSyntax);
                        } else {
                            setTopics(appInner.solaceDeployedEnvironments[0].SolaceTopicsObject.defaultSyntax);
                        }
                    }
                }).catch((error) => {
                    setTierDisabled(true);
                    setTierDescription('Tier is disabled.');
                    console.log(error);
                });
            }).catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    setNotFound(true);
                } else {
                    setNotFound(false);
                }
            });
    }, []);
    if (notFound) {
        return <ResourceNotFound />;
    }
    if (!application) {
        return <Loading />;
    }
    if (environment) {
        console.log(environment);
        console.log(topics);
    }
    const handleChange = (event) => {
        setEnvironment(event.target.value);
        console.log(event.target.value);
    };
    const handleChangeProtocol = (event) => {
        setSelectedProtocol(event.target.value);
        // console.log(event.target.value);
        let protocol;
        environment.solaceURLs.map((e) => {
            if (e.protocol === event.target.value) {
                setSelectedEndpoint(e.endpointURL);
                protocol = e.protocol;
            }
            return null;
        });
        if (protocol === 'mqtt') {
            setTopics(environment.SolaceTopicsObject.mqttSyntax);
        } else {
            setTopics(environment.SolaceTopicsObject.defaultSyntax);
        }
    };
    const handleReset = (userId) => {
        const client = new API();
        const promisedReset = client.resetApplicationPolicy(userId, application.applicationId);
        promisedReset.then((Response) => {
            if (Response.status === 200) {
                Alert.success(intl.formatMessage({
                    defaultMessage: 'Application Policy Reset request for {name} has been triggered successfully',
                    id: 'Applications.Details.Overview.reset.successful',
                }, { name: userId }));
            }
        }).catch((error) => {
            if (process.env.NODE_ENV !== 'production') {
                console.error(error);
            }
            const { response } = error;
            if (response?.body) {
                if (error.status === 400) {
                    Alert.error(response.body.description);
                } else {
                    Alert.error(intl.formatMessage({
                        defaultMessage: 'Error while resetting application policy for {name}',
                        id: 'Applications.Details.Overview.reset.error',
                    }, { name: userId }));
                }
            }
        });
    };
    const toggleResetConfirmation = () => {
        setIsResetOpen(false);
    };
    const handleResetConfirmation = () => {
        setIsResetOpen(true);
    };
    return (
        <Root>
            <div className={classes.root}>
                <Table className={classes.table}>
                    <TableBody>
                        <TableRow>
                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                <div className={classes.iconAligner}>
                                    <Icon className={classes.iconEven}>description</Icon>
                                    <span className={classes.iconTextWrapper}>
                                        <Typography variant='caption' gutterBottom align='left'>
                                            <FormattedMessage
                                                id='Applications.Details.Overview.description'
                                                defaultMessage='Description'
                                            />
                                        </Typography>
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {application.description}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                <div className={classes.iconAligner}>
                                    <Icon className={classes.iconOdd}>settings_input_component</Icon>
                                    <span className={classes.iconTextWrapper}>
                                        <Typography variant='caption' gutterBottom align='left'>
                                            <FormattedMessage
                                                id='Applications.Details.InfoBar.business.plan'
                                                defaultMessage='Business Plan'
                                            />
                                        </Typography>
                                    </span>
                                </div>
                            </TableCell>
                            {application
                                && (
                                    <TableCell className={classes.iconAligner}>
                                        {application.throttlingPolicy}
                                        {tierDescription && tierDescription.trim() && (
                                            <span className={tierDisabled ? classes.disabledTier : ''}>
                                                &nbsp;
                                                {`(${tierDescription.trim()})`}
                                            </span>
                                        )}

                                        <VerticalDivider height={40} />
                                        <Grid item xs={1} m={1}>
                                            <Button
                                                id='reset-application-policy'
                                                style={{ padding: '1px' }}
                                                onClick={handleResetConfirmation}
                                                color='grey'
                                                aria-label={(
                                                    <FormattedMessage
                                                        id='Applications.Details.Overview.application.reset'
                                                        defaultMessage='Reset'
                                                    />
                                                )}
                                            >
                                                <Icon>replay</Icon>
                                                <Typography variant='caption'>
                                                    <FormattedMessage
                                                        id='Applications.Details.Overview.application.reset.text'
                                                        defaultMessage='RESET'
                                                    />
                                                </Typography>
                                            </Button>
                                            <Tooltip
                                                interactive
                                                title={(
                                                    <FormattedMessage
                                                        id='Applications.Details.Overview.application.reset.tooltip'
                                                        defaultMessage='Reset the Application Throttle Policy for a Specific User'
                                                    />
                                                )}
                                                placement='right'
                                                classeName={classes.infoToolTip}
                                            >
                                                <IconButton className={classes.infoButton} aria-label='arch'>
                                                    <InfoIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <ResetThrottlePolicyDialog
                                                handleResetThrottlePolicy={handleReset}
                                                isResetOpen={isResetOpen}
                                                toggleResetConfirmation={toggleResetConfirmation}
                                            />
                                        </Grid>
                                    </TableCell>
                                )}
                        </TableRow>
                        <TableRow>
                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                <div className={classes.iconAligner}>
                                    <Icon className={classes.iconOdd}>assignment_turned_in</Icon>
                                    <span className={classes.iconTextWrapper}>
                                        <Typography variant='caption' gutterBottom align='left'>
                                            <FormattedMessage
                                                id='Applications.Details.Overview.workflow.status'
                                                defaultMessage='Workflow Status'
                                            />
                                        </Typography>
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {application.status}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                <div className={classes.iconAligner}>
                                    <Icon className={classes.iconEven}>account_box</Icon>
                                    <span className={classes.iconTextWrapper}>
                                        <Typography variant='caption' gutterBottom align='left'>
                                            <FormattedMessage
                                                id='Applications.Details.Overview.application.owner'
                                                defaultMessage='Application Owner'
                                            />
                                        </Typography>
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {application.owner}
                            </TableCell>
                        </TableRow>
                        {application.attributes
                            && (
                                Object.keys(application.attributes).map((attr, index) => {
                                    const attrValue = application.attributes[attr];
                                    return (
                                        <TableRow key={attr}>
                                            <TableCell component='th' scope='row' className={classes.leftCol}>
                                                <div className={classes.iconAligner}>
                                                    <Icon className={classNames(
                                                        { [classes.iconEven]: index % 2 !== 0 },
                                                        { [classes.iconOdd]: index % 2 === 0 },
                                                    )}
                                                    >
                                                        web_asset
                                                    </Icon>
                                                    <span className={classes.iconTextWrapper}>
                                                        <Typography variant='caption' gutterBottom align='left'>
                                                            {attr}
                                                        </Typography>
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {attrValue}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }))}

                    </TableBody>
                </Table>
                {}
                {application.containsSolaceApis === true && environment && topics && (
                    <div className={classes.root}>
                        <Typography id='itest-api-details-bushiness-plans-head' variant='h5'>
                            <FormattedMessage
                                id='solace.application.available.topics.heading'
                                defaultMessage='Available Topics'
                            />
                        </Typography>
                        <Typography variant='caption' gutterBottom>
                            <FormattedMessage
                                id='solace.application.available.topics.subheading'
                                defaultMessage='Topics permitted to access from solace applications'
                            />
                        </Typography>
                        <Paper className={classes.Paper}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item>
                                            <TextField
                                                select
                                                onChange={handleChange}
                                                value={environment.environmentDisplayName}
                                                style={{ maxWidth: '100%' }}
                                                variant='outlined'
                                                label='Environment Name'
                                            >
                                                {application.solaceDeployedEnvironments.map((e) => (
                                                    <MenuItem key={e} value={e.environmentDisplayName}>
                                                        {e.environmentDisplayName}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                select
                                                onChange={handleChangeProtocol}
                                                value={selectedProtocol}
                                                style={{ maxWidth: '100%' }}
                                                variant='outlined'
                                                label='Protocol'
                                            >
                                                {environment.solaceURLs.map((e) => (
                                                    <MenuItem key={e.protocol} value={e.protocol}>
                                                        {upperCaseString(e.protocol)}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid item>
                                            {/* <Paper id='gateway-envirounment' component='form' className={classes.urlPaper}>
                                                <InputBase
                                                    inputProps={{ 'aria-label': 'api url' }}
                                                    value={selectedEndpoint}
                                                    className={classes.input}
                                                />
                                            </Paper> */}
                                            <TextField
                                                style={{ minWidth: '200%' }}
                                                label='Endpoint URL'
                                                value={selectedEndpoint}
                                                variant='outlined'
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper className={classes.Paper2}>
                                        <Typography id='itest-api-details-bushiness-plans-head' variant='h6'>
                                            <FormattedMessage
                                                id='solace.application.topics.publish'
                                                defaultMessage='Publish Topics'
                                            />
                                        </Typography>
                                        <List className={classes.list}>
                                            {topics.publishTopics.map((t) => (
                                                <ListItem>
                                                    <Typography gutterBottom align='left'>
                                                        {t}
                                                    </Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6}>
                                    <Paper className={classes.Paper2}>
                                        <Typography id='itest-api-details-bushiness-plans-head' variant='h6'>
                                            <FormattedMessage
                                                id='solace.application.topics.subscribe'
                                                defaultMessage='Subscribe Topics'
                                            />
                                        </Typography>
                                        <List className={classes.list}>
                                            {topics.subscribeTopics.map((t) => (
                                                <ListItem>
                                                    <Typography gutterBottom align='left'>
                                                        {t}
                                                    </Typography>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Paper>
                    </div>
                )}
            </div>
        </Root>
    );
}
export default injectIntl(Overview);
