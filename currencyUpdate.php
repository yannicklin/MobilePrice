<?php
/**
 * Function: Update SQLite - Currency Exchange Rate with https://openexchangerates.org/api/
 * User: Yannick Lin
 * Date: 2016/4/17
 */
$sqliteFile = 'sqlite:twoudia.db';
$sqlDB = new PDO($sqliteFile) or die("cannot open database");

// Abandon the use of "INSERT OR REPLACE" for the id would be increased plenty for the UPDATE actions
//$strSQL = "INSERT OR REPLACE INTO exchangerate(currency, rate, recdate) VALUES(:currency, :rate, :recdate);";
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