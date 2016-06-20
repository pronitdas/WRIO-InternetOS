import React from 'react';
import ReactDOM from 'react-dom';
import UrlMixin from '../mixins/UrlMixin';
import classNames from 'classnames';
import ActionMenu from '../../widgets/Plus/actions/menu';
import CreateInfoTicket from './CreateInfoTicket';
import CreateControlButtons from './CreateControlButtons';
import StoreMenu from '../../widgets/Plus/stores/menu';
import Reflux from 'reflux';
import _ from 'lodash';
import center from '../actions/center';
import WrioDocument from '../store/WrioDocument.js';

// TODO: move to utils somewhere !!!!
export function replaceSpaces(str) {
    if (typeof str === "string") {
        return str.replace(/ /g, '_');
    } else {
        return str;
    }
}

function isCover(o) {
    return o.url && (typeof o.url === 'string') && (o.url.indexOf('?cover') === o.url.length - 6); // TODO: maybe regexp woud be better, huh?
}

var External = React.createClass({
    propTypes: {
        data: React.PropTypes.object.isRequired,
        active: React.PropTypes.func.isRequired,
        isActive: React.PropTypes.bool.isRequired
    },
    onClick: function (e) {
        center.external(this.props.data.url, this.props.data.name);
        ActionMenu.showSidebar(false);
        this.props.active(this);
        e.preventDefault();
    },
    getInitialState: function () {
        return {
            active: false
        };
    },
    componentWillMount: function () {
        if (this.props.isActive) {
            this.props.active(this);
        }
        center.external(this.props.data.url, this.props.data.name, true, (url) => {
            this.setState({
                url: url
            });
        });
    },
    render: function () {
        var o = this.props.data,
            className = this.state.active ? 'active' : '';
        return (
            <li className={className}>
                <a href={this.state.url} onClick={this.onClick}>{o.name}</a>
            </li>
        );
    }
});

var Article = React.createClass({
    propTypes: {
        data: React.PropTypes.object.isRequired,
        active: React.PropTypes.func.isRequired,
        isActive: React.PropTypes.bool.isRequired
    },


    onClick: function (e) {
        center.article(this.props.data.name, replaceSpaces(this.props.data.name));
        ActionMenu.showSidebar(false);
        this.props.active(this);
        e.preventDefault();
    },
    getInitialState: function () {
        return {
            active: false
        };
    },
    componentWillMount: function () {
        if (this.props.isActive) {
            this.props.active(this);
            /*    center.article(this.props.data.name, true, (url) => {
             this.setState({
             url: url
             });
             });*/
        }

    },
    render: function () {
        var o = this.props.data,
            className = this.state.active ? 'active' : '';
        return (
            <li className={className}>
                <a href={this.state.url} onClick={this.onClick} className={o.class}>{o.name}</a>
            </li>
        );
    }
});

var Cover = React.createClass({
    propTypes: {
        data: React.PropTypes.object.isRequired,
        active: React.PropTypes.func.isRequired,
        isActive: React.PropTypes.bool.isRequired
    },
    onClick: function (e) {
        center.cover(this.props.data.url);
        ActionMenu.showSidebar(false);
        this.props.active(this);
        e.preventDefault();
    },
    getInitialState: function () {
        return {
            active: false
        };
    },
    componentWillMount: function () {
        if (this.props.isActive) {
            this.props.active(this);
        }
        center.cover(this.props.data.url, null, true, (url) => {
            this.setState({
                url: url
            });
        });
    },
    render: function () {
        var o = this.props.data,
            className = this.state.active ? 'active' : '';
        return (
            <li className={className}>
                <a href={this.state.url} onClick={this.onClick}>{o.name}</a>
            </li>
        );
    }
});

var CreateDomRight = React.createClass({
    propTypes: {
        data: React.PropTypes.array.isRequired
    },

    mixins: [UrlMixin],

    active: function (child) {
        if (this.current) {
            this.current.setState({
                active: false
            });
        }
        this.current = child;
        this.current.setState({
            active: true
        });
    },

    getInitialState: function () {
        return {
            active: false,
            resize: false,
            article: {},
            author: ''
        };
    },

    componentDidMount: function () {
        this.listenStoreMenuSidebar = StoreMenu.listenTo(ActionMenu.showSidebar, this.onShowSidebar);
        this.listenStoreMenuWindowResize = StoreMenu.listenTo(ActionMenu.windowResize, this.onWindowResize);
    },

    componentWillMount: function () {
        this.props.data.forEach((o) => {
            if (o['@type'] === 'Article') {
                this.setState({
                    article: o,
                    author: o.author || ''
                });
            }
        });
    },

    onShowSidebar: function (data) {
        this.setState({
            active: data
        });
    },

    onWindowResize: function (width, height) {
        if (width > 767) {
            if (height < ReactDOM.findDOMNode(this.refs.sidebar)
                    .offsetHeight) {
                this.setState({
                    resize: true
                });
            }
        } else {
            this.setState({
                resize: true
            });
        }
    },

    componentWillUnmount: function () {
        this.listenStoreMenuSidebar();
        this.listenStoreMenuWindowResize();
    },

    render: function () {
        var className = classNames({
            'col-xs-6 col-sm-4 col-md-3 sidebar-offcanvas': true,
            'active': this.state.active
        });

        var [coverItems,articleItems,externalItems] = this.getArticleItems();
        var height = this.getHeight();

        return (
            <div className={className} id="sidebar">
                <div ref="sidebar" className="sidebar-margin">
                    {this.state.article ? <aside>
                        <CreateInfoTicket article={this.state.article} author={this.state.author}/>
                    </aside> : ''}
                    {this.state.article ?
                        <CreateControlButtons article={this.state.article} author={this.state.author}/> : null}
                    { (coverItems.length > 0) ?
                    <ul className="nav nav-pills nav-stacked" style={height}>
                        {coverItems}
                    </ul>:""}
                    <ul className="nav nav-pills nav-stacked" style={height}>
                        {articleItems}
                    </ul>
                    <ul className="nav nav-pills nav-stacked" style={height}>
                        {externalItems}
                    </ul>
                </div>
            </div>
        );
    },

    getHeight() {
        if (window.innerWidth > 767) {
            return {
                height: 'auto'
            };
        } else {
            return {
                height: window.innerHeight - 52
            };
        }
    },

    isElementOfType(currentItem, type) {
        return currentItem['@type'] === type || _.chain(currentItem.itemListElement)
                .pluck('@type')
                .contains(type)
                .value();
    },

    processItem(item, superitem) {
        if (isCover(item)) {
            var isActive = this.listName === item.name.toLowerCase();
            if (this.listName === superitem.name) {
                this.coverItems.push(<Cover data={superitem} key={this.coveritems.length} active={this.active} isActive={isActive}/>);
            } else {
                this.coverItems.push(<Cover data={item} key={this.coverItems.length} active={this.active} isActive={isActive}/>);
            }
        } else {
            var isActive = this.listName === item.name.toLowerCase();
            this.externalItems.push(<External data={item} key={this.externalItems.length} active={this.active} isActive={isActive}/>);
        }
    },

    initListName() {
        this.listName = WrioDocument.getListType();
        if (this.listName) {
            this.listName = this.listName.toLowerCase();
        }

    },

    getArticleItems() {

        var isActiveFirstArticle = true;

        this.coverItems= [];
        this.articleItems = [];
        this.externalItems = [];

        this.initListName();

        if (this.listName) {
            if (this.listName == 'cover') {
                isActiveFirstArticle = false; // if we have ?list=cover parameter in command line, don't highlight first article
            }
        }
        var add = (currentItem) => {
            if (this.isElementOfType(currentItem, "Article")) {
                var currentHash = window.location.hash.substring(1);
                var isActive = replaceSpaces(currentItem.name) === currentHash || isActiveFirstArticle;
                isActiveFirstArticle = false;
                this.articleItems.push(<Article data={currentItem} key={this.articleItems.length} active={this.active} isActive={isActive}/>);
            } else if (currentItem['@type'] === 'ItemList') {
                if (!this.isElementOfType(currentItem, 'ItemList')) {
                    this.processItem(currentItem, currentItem);
                } else {
                    currentItem.itemListElement.forEach((item) => this.processItem(item, currentItem), this);
                }
            }
            if (currentItem.hasPart) {
                currentItem.hasPart.forEach(add, this);
            }
        };
        this.props.data.forEach(add);
        return [this.coverItems,this.articleItems,this.externalItems];
    }
});

export default CreateDomRight;
