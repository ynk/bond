<?php
	function proxy($filename, $useragent = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; fr; rv:1.9.2.6) Gecko/20100625 Firefox/3.6.6")
	{
		if (!function_exists("curl_version")) { die("curl not installed"); }
		$curl = curl_init($filename);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
			curl_setopt($curl, CURLOPT_NOBODY, FALSE);
			curl_setopt($curl, CURLOPT_FORBID_REUSE, TRUE);
			curl_setopt($curl, CURLOPT_FOLLOWLOCATION, TRUE);
			
			curl_setopt($curl, CURLOPT_USERAGENT, $useragent); 
			curl_setopt($curl, CURLOPT_REFERER, $_SERVER['HTTP_REFERER']);
			
			
			$data = curl_exec($curl);
			$mimetype = curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
			$length = strlen($data);
			
			curl_close($curl);
		
		$output = array(
			"headers"	=> array(
				"content-type" 			=> array(	"value" 	=> $mimetype,
													"display" 	=> 'Content-Type: '.$mimetype),
				"content-disposition"	=> array(	"value"		=> $filename,
													"display"	=> 'Content-Disposition: attachment="'.$filename.'"'),
				"content-length"		=> array(	"value"		=> $length,
													"display"	=> "Content-Length: ".$length)
			),
			"content"	=> $data
		);
		
		return $output;
	}

	$request = proxy('http://andiquote.org/rss.php?p='.$_GET['p']);
	header($request['headers']['content-type']['display']);
	die($request['content']);
?>
