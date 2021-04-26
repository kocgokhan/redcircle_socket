<?php
$u = explode("/", $_GET['u']);
if(!empty($u[0])){$r1=$u[0];}else{$r1=null;}
if(!empty($u[1])){$r2=$u[1];}else{$r2=null;}
if(!empty($u[2])){$r3=$u[2];}else{$r3=null;}
if(!empty($u[3])){$r4=$u[3];}else{$r4=null;}
if(!empty($u[4])){$r5=$u[4];}else{$r5=null;}
if(!empty($u[5])){$r6=$u[5];}else{$r6=null;}
if(!empty($u[6])){$r7=$u[6];}else{$r7=null;}



if(empty($r1)){$in="index.php";}
	else
	{
	if($r1=='hizmetlerimiz') { $in='hizmetlerimiz.php'; }
	elseif($r1=='event') { $in='event.php'; }
		

	else
	{
		$in='index.php';

	}
}
	include $in;
?>
