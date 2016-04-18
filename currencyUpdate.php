<?php
/**
 * Function: Update SQLite - Currency Exchange Rate with https://openexchangerates.org/api/
 * User: Yannick Lin
 * Date: 2016/4/17
 */
$sqliteFile = 'sqlite:twoudia.db';
$sqlDB = new PDO($sqliteFile) or die("cannot open database");
$strSQL = "INSERT OR REPLACE INTO exchangerate(currency, rate, recdate) VALUES(:currency, :rate, :recdate);";
$objQuery = $sqlDB->prepare($strSQL);

$jsonFile = file_get_contents('https://openexchangerates.org/api/latest.json?app_id=c085701d99944612b4003f84c3764416');
$jsonArray = json_decode($jsonFile, true);

foreach ($jsonArray['rates'] as $key => $value ) {
        try{
            $objQuery->bindParam(':currency', $key, PDO::PARAM_STR);
            $objQuery->bindParam(':rate', $value, PDO::PARAM_STR);
            $objQuery->bindParam(':recdate', date('Y-m-d'), PDO::PARAM_STR);
            $objQuery->execute();
        } catch(PDOException $e) {
            echo 'Exception : '.$e->getMessage();
        }
}