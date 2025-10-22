/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {TextField, Button, Typography, InputLabel, useTheme} from '@mui/material';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FormattedMessage, injectIntl } from 'react-intl';
import Alert from '../../../Shared/Alert';
import API from '../../../../data/api';

const PREFIX = 'CommentAddLegacy';

const classes = {
    commentIcon: `${PREFIX}-commentIcon`,
    content: `${PREFIX}-content`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    textField: `${PREFIX}-textField`,
    commentAddWrapper: `${PREFIX}-commentAddWrapper`,
    commentAddButton: `${PREFIX}-commentAddButton`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.commentIcon}`]: {
        color: theme.palette.getContrastText(theme.palette.background.default),
    },

    [`& .${classes.content}`]: {
        color: theme.palette.getContrastText(theme.palette.background.default),
    },

    [`&.${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth,
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        marginTop: theme.spacing(2),
    },

    [`& .${classes.textField}`]: {
        marginTop: 0,
        marginRight: 5,
        width: '100%',
    },

    [`& .${classes.commentAddWrapper}`]: {
        display: 'flex',
        alignItems: 'top',
        flexFlow: 'column',
        '& label': {
            marginBottom: theme.spacing(1),
        },
    },

    [`& .${classes.commentAddButton}`]: {
        '& span.MuiButton-label': {
            color: theme.palette.getContrastText(theme.palette.primary.main),
        },
    }
}));

/**
 * Display a component to add a new comment
 * @class CommmentAdd
 * @extends {React.Component}
 */
class CommentAddLegacy extends React.Component {
    /**
     * Creates an instance of CommentAddLegacy
     * @param {*} props properies passed by the parent element
     * @memberof CommentAddLegacy
     */
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            currentLength: 0,
        };
        this.inputChange = this.inputChange.bind(this);
        this.handleClickAddComment = this.handleClickAddComment.bind(this);
        this.handleClickCancel = this.handleClickCancel.bind(this);
        // this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.filterCommentToAddReply = this.filterCommentToAddReply.bind(this);
    }

    /**
     * Handles the comment text when input changes
     * @param {Object} {target} target element
     * @memberof CommentAddLegacy
     */
    inputChange({ target }) {
        this.setState({ content: target.value, currentLength: target.value.length });
    }

    /**
     * Hides the component to add a new comment when cancelled
     * @memberof CommentAddLegacy
     */
    handleClickCancel() {
        this.setState({ content: '' });
        const { handleShowReply } = this.props;
        handleShowReply(-1);
    }

    /**
     * Filters the comment to add the reply
     * @memberof CommentAddLegacy
     */
    filterCommentToAddReply(commentToFilter) {
        const { replyTo } = this.props;
        return commentToFilter.id === replyTo;
    }

    /**
     * Handles adding a new comment
     * @memberof CommentAddLegacy
     */
    handleClickAddComment() {
        const {
            apiId, intl, replyTo, handleShowReply, addComment, addReply,
        } = this.props;
        const { content } = this.state;
        const Api = new API();
        const comment = {
            content: content.trim(), category: "general"
        };

        // to check whether a string does not contain only white spaces
        if (comment.content.replace(/\s/g, '').length) {
            Api.addComment(apiId, comment, replyTo)
                .then((newComment) => {
                    this.setState({ content: '' });
                    if (replyTo === null) {
                        if (addComment) {
                            addComment(newComment.body);
                        }
                    } else if (addReply) {
                        addReply(newComment.body);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    if (error.response && error.response.body && error.response.body.message) {
                        Alert.error(error.response.body.message);
                    } else {
                        Alert.error(intl.formatMessage({
                            defaultMessage: 'Something went wrong while adding the comment',
                            id: 'Apis.Details.Comments.CommentAdd.something.went.wrong',
                        }));
                    }
                });
        } else {
            Alert.error(intl.formatMessage({
                defaultMessage: 'You cannot enter a blank comment',
                id: 'Apis.Details.Comments.CommentAdd.error.blank.comment',
            }));
        }
        this.setState({ currentLength: 0 });
        if (replyTo !== null) {
            handleShowReply();
        }
    }

    handleCancel = () => {
        const { cancelCallback } = this.props;
        if (cancelCallback) {
            cancelCallback();
        } else {
            this.handleClickCancel(-1);
        }
    };
    /**
     * Render method of the component
     * @returns {React.Component} Comment html component
     * @memberof CommentAddLegacy
     */
    render() {
        const {
            cancelButton, theme, intl,
        } = this.props;
        const { content, currentLength } = this.state;
        return (
            <StyledGrid container spacing={1} className={classes.contentWrapper}>
                <Grid item xs zeroMinWidth>
                    <div className={classes.commentAddWrapper}>
                        <InputLabel htmlFor="standard-multiline-flexible">
                            <FormattedMessage
                                id='Apis.Details.Comments.CommentAdd.write.comment.label'
                                defaultMessage='Write a comment'
                            />
                        </InputLabel>
                        <TextField
                            id='standard-multiline-flexible'
                            autoFocus
                            multiline
                            rows='4'
                            className={classes.textField}
                            margin='normal'
                            placeholder={intl.formatMessage({
                                defaultMessage: 'Write a comment',
                                id: 'Apis.Details.Comments.CommentAdd.write.comment.help',
                            })}
                            inputProps={{ maxLength: theme.custom.maxCommentLength }}
                            value={content}
                            onChange={this.inputChange}
                            variant='outlined'
                        />
                        <Typography className={classes.content} align='right'>
                            {currentLength + '/' + theme.custom.maxCommentLength}
                        </Typography>
                    </div>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Button
                                variant='contained'
                                color='primary'
                                disabled={currentLength === 0}
                                onClick={() => this.handleClickAddComment()}
                                className={classes.commentAddButton}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Comments.CommentAdd.btn.add.comment'
                                    defaultMessage='Comment'
                                />
                            </Button>
                        </Grid>
                        {cancelButton && (
                            <Grid item>
                                <Button onClick={this.handleCancel} color='grey' className={classes.button}>
                                    <FormattedMessage
                                        id='Apis.Details.Comments.CommentAdd.btn.cancel'
                                        defaultMessage='Cancel'
                                    />
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </StyledGrid>
        );
    }
}

CommentAddLegacy.defaultProps = {
    replyTo: null,
    handleShowReply: null,
    commentsUpdate: null,
    cancelCallback: null,
};

CommentAddLegacy.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    cancelButton: PropTypes.bool.isRequired,
    apiId: PropTypes.string.isRequired,
    replyTo: PropTypes.string,
    handleShowReply: PropTypes.func,
    commentsUpdate: PropTypes.func,
    allComments: PropTypes.instanceOf(Array).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    cancelCallback: PropTypes.func,
};

function CommentAdd(props) {
    const { handleShowReply, replyTo, apiId, intl, addComment, addReply, cancelCallback, cancelButton,
    } = props;
    const theme = useTheme();
    return (
        <CommentAddLegacy
            handleShowReply={handleShowReply}
            replyTo={replyTo}
            apiId={apiId}
            intl={intl}
            addComment={addComment}
            addReply={addReply}
            cancelCallback={cancelCallback}
            cancelButton={cancelButton}
            theme={theme}
        />
    );
}

export default injectIntl((CommentAdd));
