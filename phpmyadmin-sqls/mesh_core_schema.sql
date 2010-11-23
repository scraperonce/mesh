-- phpMyAdmin SQL Dump
-- version 2.11.8.1deb5+lenny6
-- http://www.phpmyadmin.net
--
-- ホスト: localhost
-- 生成時間: 2010 年 11 月 23 日 16:34
-- サーバのバージョン: 5.0.51
-- PHP のバージョン: 5.2.6-1+lenny9

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- データベース: `mesh_core_schema`
--

-- --------------------------------------------------------

--
-- テーブルの構造 `logs`
--

CREATE TABLE IF NOT EXISTS `logs` (
  `id` int(11) NOT NULL auto_increment,
  `subject_id` int(11) NOT NULL,
  `json` mediumtext,
  `date` datetime NOT NULL,
  PRIMARY KEY  (`id`),
  KEY `class` (`subject_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- テーブルのデータをダンプしています `logs`
--


-- --------------------------------------------------------

--
-- テーブルの構造 `subjects`
--

CREATE TABLE IF NOT EXISTS `subjects` (
  `id` int(11) NOT NULL auto_increment,
  `title` varchar(64) NOT NULL,
  `description` text,
  `teacher` varchar(32) NOT NULL,
  `password` varchar(32) default NULL,
  PRIMARY KEY  (`id`),
  KEY `title` (`title`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- テーブルのデータをダンプしています `subjects`
--

INSERT INTO `subjects` (`id`, `title`, `description`, `teacher`, `password`) VALUES
(1, '授業テスト', NULL, 'admin', NULL),
(2, '伝播工学', 'ここが説明だよ', 'admin', NULL),
(3, 'データ構造とよくわからない力', 'すごいよ', 'admin', NULL),
(4, '関数型プログラミング演習', 'JavaScriptを用いて関数型と呼ばれるう～んッ！！！', 'ishii', NULL);

-- --------------------------------------------------------

--
-- テーブルの構造 `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `name` varchar(32) NOT NULL,
  `password` varchar(32) default NULL,
  `fullname` varchar(64) default NULL,
  `lasttime` datetime NOT NULL,
  PRIMARY KEY  (`name`),
  KEY `fullname` (`fullname`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- テーブルのデータをダンプしています `users`
--

INSERT INTO `users` (`name`, `password`, `fullname`, `lasttime`) VALUES
('admin', 'mesh', 'MeSH Server Administrator', '2010-11-01 09:49:49'),
('ishii', 'mesh', '石井久孝', '2010-11-11 23:29:48');
