import React, { Component } from 'react';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <header className="container">
                <h1>Welcome to Mobile Price Global Comparison Web APP</h1>

                <div className="row">
                    <p className="col-lg-12 margin-less">
                        All price information is retrieved from official online stores and local retailers of the listed mobile phone brands. Currency conversion is calculated only as reference and prices may vary. There is no guarantee on the accuracy or availability on the price of the listed mobile phones.
                    </p>
                </div>
            </header>
        );
    }
}

export default Header; // Don't forget to use export default!
