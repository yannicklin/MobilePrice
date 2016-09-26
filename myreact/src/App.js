import React, {Component} from 'react';
import logo from '../res/logo.svg';
import '../res/App.css';
import Button from './Button';
import Header from './Header';
import MainContent from './MainContent';
import Footer from './Footer';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <h2>Welcome to React</h2>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                <Button />

                /* Below is the one to modify */
                <Header />
                /*
                 <header class="container">
                 <h1>Welcome to Mobile Price Global Comparison Web APP</h1>

                 <div class="row">
                 <p class="col-lg-12 margin-less">
                 All price information is retrieved from official online stores and local retailers of the listed mobile phone brands. Currency conversion is calculated only as reference and prices may vary. There is no guarantee on the accuracy or availability on the price of the listed mobile phones.
                 </p>
                 </div>
                 </header>
                 */
                <MainContent />
                /*
                 <section class="container" ng-controller="MainCtrl">
                 <div class="row">
                 <form class="form-inline dash-border" role="form">
                 <label for="selProductBrand">Brand</label>
                 <select class="form-control" name="selProductBrand" id="selProductBrand" ng-model="form.selProductBrand"
                 ng-change="selProductBrandChanged()"
                 ng-options="option.brand as option.brand for option in optProductBrand | orderBy:'brand'"></select>

                 <label for="selProductModel">Model</label>
                 <select class="form-control" name="selProductModel" id="selProductModel" ng-model="form.selProductModel"
                 ng-change="selProductModelChanged()" ng-disabled="! form.selProductBrand"
                 ng-options="option.model as option.model for option in optProductModel | orderBy:'model'"></select>

                 <label for="selProductSPEC">SPEC</label>
                 <select class="form-control" name="selProductSPEC" id="selProductSPEC" ng-model="form.selProductSPEC"
                 ng-change="selProductSPECChanged()" ng-disabled="! form.selProductModel"
                 ng-options="option.spec as option.spec for option in optProductSPEC | orderBy:'spec'"></select>

                 <label for="selCurrency">Currency</label>
                 <select class="form-control" name="selCurrency" id="selCurrency" ng-model="form.selCurrency"
                 ng-change="selCurrencyChanged()"
                 ng-options="option.currency as option.currency for option in optCurrency | orderBy:'currency'"></select>

                 <label for="comDate">Exchange Date</label>

                 <div class="input-group" id="comDate" name="comDate">
                 <input type="text" class="form-control" name="inpEXDate" id="inpEXDate"
                 uib-datepicker-popup="yyyy-MM-dd"
                 ng-model="form.inpEXDate" is-open="inpEXDatePopup.opened" datepicker-options="inpEXDateOpt"
                 ng-required="true" close-text="Close" ng-change="condsCheck()"/>
                 <span class="input-group-btn">
                 <button type="button" class="btn btn-info" ng-click="inpEXDateClick()">
                 <i class="glyphicon glyphicon-calendar"></i>
                 </button>
                 </span>
                 </div>

                 <label for="btnPriceQuery"></label>
                 <button class="btn btn-success form-control" name="btnPriceQuery" id="btnPriceQuery"
                 ng-show="condsCompleted" ng-click="priceEnquiry()">
                 Search
                 </button>
                 </form>
                 </div>
                 <div class="row" ng-show="GridData">
                 <uib-tabset active="activeJustified" justified="true" type="pills">
                 <uib-tab ng-repeat="tab in tabs" heading="{{tab.title}}" active="tab.active" disable="tab.disabled">
                 <div ng-include="tab.template"></div>
                 </uib-tab>
                 </uib-tabset>
                 </div>
                 <div class="row">
                 <p class="col-lg-12 margin-less padding-5px dash-border">
                 For the history of price updated, please go here: <a class="btn btn-info btn-sm" title="MOBILE PRICE HISTORY" href="history.html" target="_self">History</a>
                 </p>
                 </div>
                 </section>
                 */
                <Footer />
                /*
                 <footer class="container">
                 <div class="row">
                 <div class="col-xs-4 col-sm-3 logo logo-apple"><a href="http://www.apple.com/" title="Mobile: APPLE" target="apple"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-sony"><a href="http://www.sonymobile.com/us/" title="Mobile: SONY" target="sony"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-htc"><a href="http://www.htc.com/us/" title="Mobile: HTC" target="htc"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-microsoft"><a href="https://www.microsoft.com/en/mobile/phones/lumia/" title="Mobile: MICROSOFT" target="microsoft"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-samsung"><a href="http://www.samsung.com/us/" title="Mobile: SAMSUNG" target="samsung"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-lg"><a href="http://www.lg.com/us" title="Mobile: LG" target="lg"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-motorola"><a href="http://www.motorola.com/us/home" title="Mobile: MOTOROLA" target="motorola"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-xiaomi"><a href="http://www.mi.com/en/" title="Mobile: XIOAMI" target="xioami"></a></div>
                 </div>
                 <div class="row">
                 <div class="col-xs-4 col-sm-4 col-sm-offset-1 logo logo-twoudia"><a href="https://www.twoudia.com/" title="Vendor: TWOUDIA" target="twoudia"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-openexchangerates"><a href="https://openexchangerates.org/" title="Vendor: OPENEXCHANGERATES" target="openexchangerates"></a></div>
                 <div class="col-xs-4 col-sm-3 logo logo-openshift"><a href="https://www.openshift.com/" title="Vendor: OPENSHIFT" target="openshift"></a></div>
                 </div>
                 <div class="row">
                 <div class="col-xs-12 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2">WEB Service: <a href="https://mobileprice.twoudia.work/" title="MOBILE PRICE HOME" target="_self">Mobile Price Compare</a> is proudly created by <a href="https://www.twoudia.com/" title="TWOUDIA" target="twoudia">TWOUDIA</a> @ {{ copyrightsyear }}. All rights are reserved.
                 </div>
                 </div>
                 </footer>
                 */
            </div>
        );
    }
}

export default App;
