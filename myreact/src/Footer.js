import React, { Component } from 'react';

var  copyrightsyear =   (new Date().getFullYear() > 2016) ? '2016 - ' + (new Date().getFullYear()) : '2016';

class Footer extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <footer className="container">
                <div className="row">
                    <div className="col-xs-4 col-sm-3 logo logo-apple"><a href="http://www.apple.com/" title="Mobile: APPLE" target="apple"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-sony"><a href="http://www.sonymobile.com/us/" title="Mobile: SONY" target="sony"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-htc"><a href="http://www.htc.com/us/" title="Mobile: HTC" target="htc"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-microsoft"><a href="https://www.microsoft.com/en/mobile/phones/lumia/" title="Mobile: MICROSOFT" target="microsoft"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-samsung"><a href="http://www.samsung.com/us/" title="Mobile: SAMSUNG" target="samsung"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-lg"><a href="http://www.lg.com/us" title="Mobile: LG" target="lg"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-motorola"><a href="http://www.motorola.com/us/home" title="Mobile: MOTOROLA" target="motorola"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-xiaomi"><a href="http://www.mi.com/en/" title="Mobile: XIOAMI" target="xioami"></a></div>
                </div>
                <div className="row">
                    <div className="col-xs-4 col-sm-4 col-sm-offset-1 logo logo-twoudia"><a href="https://www.twoudia.com/" title="Vendor: TWOUDIA" target="twoudia"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-openexchangerates"><a href="https://openexchangerates.org/" title="Vendor: OPENEXCHANGERATES" target="openexchangerates"></a></div>
                    <div className="col-xs-4 col-sm-3 logo logo-openshift"><a href="https://www.openshift.com/" title="Vendor: OPENSHIFT" target="openshift"></a></div>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2">WEB Service: <a href="https://mobileprice.twoudia.work/" title="MOBILE PRICE HOME" target="_self">Mobile Price Compare</a> is proudly created by <a href="https://www.twoudia.com/" title="TWOUDIA" target="twoudia">TWOUDIA</a> @ { copyrightsyear }. All rights are reserved.
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer; // Don't forget to use export default!