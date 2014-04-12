-- phpMyAdmin SQL Dump
-- version 3.4.10.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 13, 2013 at 12:34 PM
-- Server version: 5.1.60
-- PHP Version: 5.3.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `dscourse`
--
CREATE DATABASE `dscourse` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `dscourse`;

-- --------------------------------------------------------



--
-- Table structure for table `discussionPosts`
--

CREATE TABLE IF NOT EXISTS `discussionPosts` (
  `discussionPostID` int(20) NOT NULL AUTO_INCREMENT,
  `discussionID` int(12) NOT NULL,
  `postID` int(20) NOT NULL,
  `discussionPostTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `postStatus` varchar(100) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`discussionPostID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=607 ;

-- --------------------------------------------------------




--
-- Table structure for table `posts`
--

CREATE TABLE IF NOT EXISTS `posts` (
  `postID` int(12) NOT NULL AUTO_INCREMENT,
  `postFromId` int(10) NOT NULL,
  `postAuthorId` int(10) NOT NULL,
  `postMessage` text NOT NULL,
  `postTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `postToWhom` text NOT NULL,
  `postMentions` text NOT NULL,
  `postSelection` text NOT NULL,
  `postContext` text NOT NULL,
  `postType` varchar(255) NOT NULL,
  `postTags` varchar(255) NOT NULL,
  `postSubject` varchar(255) NOT NULL,
  `postMedia` text NOT NULL,
  `postMediaType` varchar(20) NOT NULL,
  PRIMARY KEY (`postID`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=603 ;

-- --------------------------------------------------------



/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
