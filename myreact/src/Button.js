import React, { Component } from 'react';
import '../res/Button.css'; // Tell Webpack that Button.js uses these styles

class Button extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return <div className="Button" />;
    }
}

export default Button; // Don't forget to use export default!
