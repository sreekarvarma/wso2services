/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useReducer } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { FormattedMessage } from 'react-intl';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { green } from '@mui/material/colors';

const PREFIX = 'NewTopic';

const classes = {
    root: `${PREFIX}-root`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    buttonSuccess: `${PREFIX}-buttonSuccess`,
    checkItem: `${PREFIX}-checkItem`,
    divider: `${PREFIX}-divider`,
    chip: `${PREFIX}-chip`,
    imageContainer: `${PREFIX}-imageContainer`,
    imageWrapper: `${PREFIX}-imageWrapper`,
    subtitle: `${PREFIX}-subtitle`,
    specialGap: `${PREFIX}-specialGap`,
    resourceTitle: `${PREFIX}-resourceTitle`,
    ListRoot: `${PREFIX}-ListRoot`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    title: `${PREFIX}-title`,
    helpButton: `${PREFIX}-helpButton`,
    helpIcon: `${PREFIX}-helpIcon`,
    htmlTooltip: `${PREFIX}-htmlTooltip`,
    lifecycleWrapper: `${PREFIX}-lifecycleWrapper`,
    lifecycleIcon: `${PREFIX}-lifecycleIcon`,
    leftSideWrapper: `${PREFIX}-leftSideWrapper`,
    notConfigured: `${PREFIX}-notConfigured`,
    url: `${PREFIX}-url`
};

const StyledPaper = styled(Paper)((
    {
        theme
    }
) => ({
    [`&.${classes.root}`]: {
        ...theme.mixins.gutters(),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },

    [`& .${classes.contentWrapper}`]: {
        marginTop: theme.spacing(2),
    },

    [`& .${classes.buttonSuccess}`]: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },

    [`& .${classes.checkItem}`]: {
        textAlign: 'center',
    },

    [`& .${classes.divider}`]: {
        marginTop: 20,
        marginBottom: 20,
    },

    [`& .${classes.chip}`]: {
        margin: theme.spacing(0.5),
        padding: 0,
        height: 'auto',
        '& span': {
            padding: '0 5px',
        },
    },

    [`& .${classes.imageContainer}`]: {
        display: 'flex',
    },

    [`& .${classes.imageWrapper}`]: {
        marginRight: theme.spacing(3),
    },

    [`& .${classes.subtitle}`]: {
        marginTop: theme.spacing(0),
    },

    [`& .${classes.specialGap}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.resourceTitle}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.ListRoot}`]: {
        padding: 0,
        margin: 0,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
    },

    [`& .${classes.title}`]: {
        flex: 1,
    },

    [`& .${classes.helpButton}`]: {
        padding: 0,
        minWidth: 20,
    },

    [`& .${classes.helpIcon}`]: {
        fontSize: 16,
    },

    [`& .${classes.htmlTooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(14),
        border: '1px solid #dadde9',
        '& b': {
            fontWeight: theme.typography.fontWeightMedium,
        },
    },

    [`& .${classes.lifecycleWrapper}`]: {
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.lifecycleIcon}`]: {
        fontSize: 36,
        color: 'green',
        marginRight: theme.spacing(1),
    },

    [`& .${classes.leftSideWrapper}`]: {
        paddingRight: theme.spacing(2),
    },

    [`& .${classes.notConfigured}`]: {
        color: 'rgba(0, 0, 0, 0.40)',
    },

    [`& .${classes.url}`]: {
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }
}));

/**
 * API Topics page
 *
 * @param {*} props
 * @returns
 */
function Topics(props) {
    function configReducer(currentState, configAction) {
        const { action, value } = configAction;
        switch (action) {
            case 'name':
                // eslint-disable-next-line no-param-reassign
                currentState[action] = value;
                break;
            default:
                break;
        }
        return currentState;
    }

    const {  handleAddTopic, handleCancelAddTopic } = props;
    // eslint-disable-next-line no-unused-vars
    // const { api, updateAPI } = useContext(APIContext);
    const [topic, inputsDispatcher] = useReducer(configReducer, {
        name: '',
    });

    function handleOnChange(event) {
        const { name: action, value } = event;
        inputsDispatcher({ action, value });
    }

    return (
        <StyledPaper className={classes.root}>
            <Grid container direction='row' justifyContent='center' alignItems='center'>
                <Grid item xs={12}>
                    <Typography component='h4' align='left'>
                        Add New Topic
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        autoFocus
                        fullWidth
                        id='topic-name'
                        label={(
                            <>
                                <FormattedMessage
                                    id='Apis.Create.Components.NewTopic.topic.name'
                                    defaultMessage='Topic Name'
                                />
                                <sup>*</sup>
                            </>
                        )}
                        helperText='Provide a name for the topic'
                        name='name'
                        margin='normal'
                        variant='outlined'
                        onChange={(e) => {
                            let { value } = e.target;
                            if (value.length > 0 && value.substr(0, 1) !== '/') {
                                value = '/' + value;
                            }
                            handleOnChange({ name: 'name', value });
                        }}
                    />
                </Grid>
                <Grid container direction='row' justifyContent='flex-start' alignItems='center' spacing={2}>
                    <Grid item>
                        <Button
                            id='itest-id-apitopics-addtopic'
                            variant='contained'
                            color='primary'
                            onClick={() => handleAddTopic(topic)}
                        >
                            Add
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            id='itest-id-apitopics-canceladdtopic'
                            variant='contained'
                            color='primary'
                            onClick={handleCancelAddTopic}
                        >
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </StyledPaper>
    );
}

Topics.propTypes = {
    classes: PropTypes.shape({}).isRequired,
};

export default (Topics);
