<?php
/**
 * Function: Update SQLite - Currency Exchange Rate with https://openexchangerates.org/api/
 * User: Yannick Lin
 * Date: 2016/09/01
 */
$sqliteFile = "sqlite:/var/lib/openshift/570ce99f2d52719720000015/app-root/repo/twoudia.db";
$sqlDB = new PDO($sqliteFile) or die("cannot open database");

// Abandon the use of "INSERT OR REPLACE" for the id would be increased plenty for the UPDATE actions
$objUpdateQuery = $sqlDB->prepare("UPDATE exchangerate SET rate=:rate WHERE currency=:currency and date(recdate)=date(:recdate);");
$objInsertQuery = $sqlDB->prepare("INSERT OR IGNORE INTO exchangerate(currency, rate, recdate) VALUES(:currency, :rate, :recdate);");

if (!empty($_GET["date"])) {
    $recDate = date("Y-m-d", strtotime($_GET["date"]));
    $strAPITarget = "historical/".$recDate.".json";
}else{
    $recDate = date('Y-m-d');
    $strAPITarget = "latest.json";
}
$jsonFile = file_get_contents("https://openexchangerates.org/api/".$strAPITarget."?app_id=c085701d99944612b4003f84c3764416");
$jsonArray = json_decode($jsonFile, true);

foreach ($jsonArray['rates'] as $key => $value) {
    try {
        $objUpdateQuery->bindParam(':currency', $key, PDO::PARAM_STR);
        $objUpdateQuery->bindParam(':rate', $value, PDO::PARAM_STR);
        $objUpdateQuery->bindParam(':recdate', $recDate, PDO::PARAM_STR);
        $objInsertQuery->bindParam(':currency', $key, PDO::PARAM_STR);
        $objInsertQuery->bindParam(':rate', $value, PDO::PARAM_STR);
        $objInsertQuery->bindParam(':recdate', $recDate, PDO::PARAM_STR);
        $objUpdateQuery->execute();
        $objInsertQuery->execute();
    } catch (PDOException $e) {
        echo 'Exception : ' . $e->getMessage();
    }
}

// Update the t_ratetable Table with assigned/current date exchangerate information
$objInsertQuery = $sqlDB->prepare("INSERT OR IGNORE INTO t_ratetable(currency, base, usdbuyrate_date, tobaserate_date, usdbuyrate_30days, tobaserate_30days, recdate) 
SELECT VEXT1.currency, VEXT2.currency AS base, VEXT1.rate AS usdbuyrate_date, VEXT2.rate / VEXT1.rate AS tobaserate_date, VEXT1.avgrate30days AS usdbuyrate_30days, VEXT2.avgrate30days / VEXT1.avgrate30days AS tobaserate_30days, VEXT1.recdate 
	FROM (SELECT * FROM v_exchangerate WHERE recdate = :recdate AND currency IN (SELECT v_currency_price.currency FROM v_currency_price)) VEXT1 
	INNER JOIN (SELECT * FROM v_exchangerate WHERE recdate = :recdate AND currency IN (SELECT v_currency_country.currency FROM v_currency_country)) VEXT2");
try {
    $objInsertQuery->bindParam(':recdate', $recDate, PDO::PARAM_STR);
    $objInsertQuery->execute();
} catch (PDOException $e) {
    echo 'Exception : ' . $e->getMessage();
}

// Update the t_pricetable Table with assigned/current date
$objInsertQuery = $sqlDB->prepare("INSERT OR REPLACE INTO t_pricetable(brand, model, spec, detail, country, country_iso, continent, subregion, currency, price, memo, link_label, link_uri, updatedate, exchange_date) 
SELECT v_product.brand, v_product.model, v_product.spec, v_product.detail, country.country, country.country_iso, country.continent, country.subregion, country.currency, priceT1.price, priceT1.memo, priceT1.link_label, priceT1.link_uri, priceT1.recdate AS updatedate, v_pricetimescope.exchange_date
	FROM price priceT1 INNER JOIN v_pricetimescope ON priceT1.product_id = v_pricetimescope.product_id AND priceT1.country_id = v_pricetimescope.country_id AND priceT1.recdate = v_pricetimescope.recdate INNER JOIN v_product ON priceT1.product_id = v_product.id INNER JOIN country ON priceT1.country_id = country.id
	WHERE priceT1.price > 0 AND v_pricetimescope.exchange_date = :recdate ;");
try {
    $objInsertQuery->bindParam(':recdate', $recDate, PDO::PARAM_STR);
    $objInsertQuery->execute();
} catch (PDOException $e) {
    echo 'Exception : ' . $e->getMessage();
}