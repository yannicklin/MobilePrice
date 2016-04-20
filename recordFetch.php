<?php
/**
 * Function: get SQLite records into JSON result
 * User: Yannick Lin
 * Date: 2016/4/17
 */
if (empty($_GET["table"])) exit;

// Specify your sqlite database name and path //
$sqliteFile = 'sqlite:twoudia.db';

$sqlDB = new PDO($sqliteFile) or die("cannot open database");
$sqlDB->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $strSQL = "SELECT * FROM " . htmlspecialchars($_GET["table"]);
    if ($_GET["cond"]=='y') {
        $strSQL .= " WHERE 1 = 1";
        foreach ($_GET as $key => $value) {
            if (!in_array($key, array('table','cond'), true )) $strSQL .= " and ".htmlspecialchars($key)."='".htmlspecialchars($value)."'";
        }
    }
    //echo "SQL statement is : ".$strSQL."<br />";
    $smst = $sqlDB->prepare($strSQL);
    $smst->execute();

    echo json_encode($smst->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    echo 'Exception : ' . $e->getMessage();
    exit;
}