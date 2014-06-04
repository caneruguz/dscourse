<?php


$dbhost = "localhost";
$port = "5432";
$dbname = "canlead";
$dbuser = "root";
$dbpass = "root";


try {
    $pdo = new PDO("mysql:host=$dbhost;port=$port;dbname=$dbname",$dbuser,$dbpass);
} catch (PDOException $e) {
    print "Error!: " . $e->getMessage() . "<br/>";
    die();
}
?>