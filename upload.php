<?php
/**
 * author: Tobias Nickel
 * an file Uplaod and sharing server, do demonstrate the usage of tUploader.js.
 * run this server, useing the PHP command: 
 *		php -S 0.0.0.0:8080 upload.php
 * and then visit: http://localhost:8080/ in your borwser.
 * do not let this server run public, or some hacker could delete you all your files ! ! ! 
 * -> check the path "/delete.json".
 */


/**
 * create file with content, and create folder structure if doesn't exist 
 * I found this method on http://stackoverflow.com/questions/13372179/creating-a-folder-when-i-run-file-put-contents
 * @param String $filepath
 * @param String $message
 */
function forceFilePutContents ($filepath, $message){
    try {
        $isInFolder = preg_match("/^(.*)\/([^\/]+)$/", $filepath, $filepathMatches);
        if($isInFolder) {
            $folderName = $filepathMatches[1];
            $fileName = $filepathMatches[2];
            if (!is_dir($folderName)) {
                mkdir($folderName, 0777, true);
            }
        }
        file_put_contents($filepath, $message);
    } catch (Exception $e) {
        echo "ERR: error writing '$message' to '$filepath', ". $e->getMessage();
    }
}

$uri=explode('?',$_SERVER["REQUEST_URI"]);
switch($uri[0]){
	case '/tUploader.min.js':
	case '/tUploader.js':
		echo file_get_contents('./tUploader.js');
	break;
	case '/delete.json':
		$name='uploads/'.(explode('=',$uri[1])[1]);
		if(file_exists($name)){
			unlink($name);
		}
		return "deleted ".$name;
	break;
	case '/upload.json':
		// $_FILES is from PHP
		// ['files'] is from the tUploader's .varName Property
		// and this code is from http://php.net/manual/en/function.move-uploaded-file.php
		foreach ($_FILES["files"]["error"] as $key => $error) {
			if ($error == UPLOAD_ERR_OK) {
				$tmp_name = $_FILES["files"]["tmp_name"][$key];
				$name = $_FILES["files"]["name"][$key];
				forceFilePutContents("./uploads/$name",file_get_contents($tmp_name));
			}
		}
		echo 'true';
	break;
	case '/uploads.json':
		$dir=scandir( './uploads/' );
		// remove the first two folders "." and ".."
		array_shift($dir);
		array_shift($dir);
		echo json_encode($dir);
		break;
	break;
	case '/':
	case '/upload.html':
	default:
		echo file_get_contents ( './upload.html');
		break;
}