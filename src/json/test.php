<?php

$file = file_get_contents('cities.json');
$json = json_decode($file);

$cities = [];

foreach($json as $city){
	$ll = explode(",", $city->ll);
	$cities[] = [$city->city, $ll[0], $ll[1]];
}
echo "<pre>";
print_r(json_encode($cities));
echo "</pre>";
