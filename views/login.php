<?php
	require("./dynamics/init.php");
	
	// すでにログイン済みならリダイレクト
	if (isset($_SESSION["username"])) {
		header("Location: ./home.php");
		exit();
	}
	
	function session_redirect_home($name) {
			$_SESSION["username"] = $name;
			header("Location: ./home.php");
			exit();
	}

	$error_status = 0;
	
	if ($_SERVER["REQUEST_METHOD"] == "POST") {
		// 接続
		$link = mysql_connect("localhost", "root", "mesh");
		
		mysql_select_db("mesh_core_schema", $link);
		
		
		$user = mysql_real_escape_string($_POST["user"]);
		$pass = mysql_real_escape_string($_POST["pass"]);
		$sid = mysql_real_escape_string(session_id());
		
		if ($user == "") {
			$error_status = 2;
		}
		
		if ($error_status == 0) {
			$sql = "SELECT * FROM users WHERE name = '$user'";
			$res = mysql_query($sql, $link);
			if ($row = mysql_fetch_assoc($res)) {
				if ($row["password"] == $pass) {
					$sql = "UPDATE users SET sid = '$sid' WHERE name = '$user'";
					mysql_query($sql, $link);
					
					$_SESSION["is_teacher"] = true;
					session_redirect_home($user);
				} else {
					$error_status = 1;
				}
			} else {
				session_redirect_home($user);
			}
		}
	}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>MeSH ログイン</title>
<link rel="stylesheet" type="text/css" href="./stylesheets/base.css">
<style type="text/css">
#error_message {
	padding: 1em;
	background-color: #ffe0e0;
	border: 2px solid red;
}
form {
	margin-top: 1em; padding: 1em;
	border: 1px solid gray;
}
</style>
</head>
<body>
<h1>MeSHへようこそ</h1>
<form action="<?= $_SERVER["PHP_SELF"] ?>" method="post">
<h2>ログイン</h2>
<p>学生はパスワードを入れる必要はありません</p>
<p>ユーザ名:<input type="text" name="user">&nbsp;パスワード&nbsp;<input type="password" name="pass">&nbsp;<input type="submit" value="ログイン"></p>
<?php
	if ($error_status == 1) {
		print '<p id="error_message">教員アカウントです。パスワードが間違っています。</p>';
	} else if ($error_status == 2) {
		print '<p id="error_message">入力欄は空白にできません</p>';
	}
?>
</form>
</form>
</body>
</html>
