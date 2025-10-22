/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {
    TextField, Button, Typography, InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { FormattedMessage, injectIntl } from 'react-intl';
import Alert from 'AppComponents/Shared/Alert';
import CommentsAPI from 'AppData/Comments';
import { isRestricted } from 'AppData/AuthManager';

const PREFIX = 'CommentAdd';

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
        '& > span': {
            color: theme.palette.getContrastText(theme.palette.primary.main) + '! important',
        },
    }
}));

/**
   * Display a component to add a new comment
   * @class CommmentAdd
   * @extends {React.Component}
   */
class CommentAdd extends React.Component {
    /**
     * Creates an instance of CommentAdd
     * @param {*} props properies passed by the parent element
     * @memberof CommentAdd
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
        this.filterCommentToAddReply = this.filterCommentToAddReply.bind(this);
    }

    /**
     * Handles the comment text when input changes
     * @param {Object} {target} target element
     * @memberof CommentAdd
     */
    inputChange({ target }) {
        this.setState({ content: target.value, currentLength: target.value.length });
    }

    /**
     * Hides the component to add a new comment when cancelled
     * @memberof CommentAdd
     */
    handleClickCancel() {
        this.setState({ content: '' });
        const { handleShowReply } = this.props;
        handleShowReply();
    }

    /**
     * Filters the comment to add the reply
     * @memberof CommentAdd
     */
    filterCommentToAddReply(commentToFilter) {
        const { replyTo } = this.props;
        return commentToFilter.id === replyTo;
    }

    /**
     * Handles adding a new comment
     * @memberof CommentAdd
     * * */
    handleClickAddComment() {
        const {
            api: { id: apiId }, replyTo, handleShowReply, addComment, addReply, intl
        } = this.props;
        const { content } = this.state;
        const comment = {
            content: content.trim(), category: 'general',
        };

        // to check whether a string does not contain only white spaces
        if (comment.content.replace(/\s/g, '').length) {
            CommentsAPI.add(apiId, comment, replyTo)
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
                    if (error.response) {
                        Alert.error(error.response.body.message);
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.Comments.Comment.Add.error',
                            defaultMessage: 'Something went wrong while adding the comment',
                        }));
                    }
                });
        } else {
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.Comments.Comment.Add.blank.error',
                defaultMessage: 'You cannot enter a blank comment',
            }));
        }
        this.setState({ currentLength: 0 });
        if (replyTo !== null) {
            handleShowReply();
        }
    }

    /**
     * Render method of the component
     * @returns {React.Component} Comment html component
     * @memberof CommentAdd
     */
    render() {
        const {
            cancelButton, theme, intl, api,
        } = this.props;
        const { content, currentLength } = this.state;
        return (
            <StyledGrid container spacing={2} className={classes.contentWrapper}>
                <Grid item xs zeroMinWidth>
                    <div className={classes.commentAddWrapper}>
                        <InputLabel htmlFor='standard-multiline-flexible'>
                            <FormattedMessage
                                id='Apis.Details.Comments.CommentAdd.write.comment.label'
                                defaultMessage='Write a comment'
                            />
                        </InputLabel>
                        <TextField
                            id='standard-multiline-flexible'
                            data-testid='new-comment-field'
                            autoFocus
                            multiline
                            disabled={api.isRevision 
                            || isRestricted(['apim:api_create', 'apim:api_publish'], api)}
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
                                disabled={api.isRevision ||
                                isRestricted(['apim:api_create', 'apim:api_publish'], api)
                                || currentLength === 0}
                                onClick={() => this.handleClickAddComment()}
                                className={classes.commentAddButton}
                                id='add-comment-btn'
                            >
                                <FormattedMessage
                                    id='Apis.Details.Comments.CommentAdd.btn.add.comment'
                                    defaultMessage='Comment'
                                />
                            </Button>
                        </Grid>
                        {cancelButton && (
                            <Grid item>
                                <Button onClick={() => this.handleClickCancel(-1)} className={classes.button}>
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

CommentAdd.defaultProps = {
    replyTo: null,
    handleShowReply: null,
};

CommentAdd.propTypes = {
    cancelButton: PropTypes.bool.isRequired,
    api: PropTypes.instanceOf(Object).isRequired,
    replyTo: PropTypes.string,
    handleShowReply: PropTypes.func,
    theme: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

export default injectIntl((props) => {
    const theme = useTheme();
    return <CommentAdd {...props} theme={theme} />;
});
