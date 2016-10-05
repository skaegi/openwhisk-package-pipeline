#!/bin/bash
#
# Copyright 2016 IBM Corp. All Rights Reserved.
# 
# Licensed under the Apache License, Version 2.0 (the “License”);
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#  https://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an “AS IS” BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
 
CURRENT_NAMESPACE=`wsk property get --namespace | awk '{print $3}'`
echo "Current namespace is $CURRENT_NAMESPACE."

function usage() {
  echo "Usage: $0 [--install,--uninstall,--update]"
}

function install() {
  echo "Creating pipeline package"
  wsk package create pipeline -p endpoint `wsk property get --apihost | awk -F"([ ][ ]+)|(\t+)" '{print $2}'`

  echo "Creating actions and feeds"
  wsk action create pipeline/run run.js
  wsk action create pipeline/hook hook.js -a feed true

  wsk list
}

function uninstall() {
  echo "Removing actions and feeds..."
  wsk action delete pipeline/run
  wsk action delete pipeline/hook
  
  echo "Removing pipeline package..."
  wsk package delete pipeline
  
  echo "Done"
  wsk list
}

function update() {
  wsk action update pipeline/run run.js
  wsk action update pipeline/hook hook.js -a feed true
}

case "$1" in
"--install" )
	install
	;;
"--uninstall" )
	uninstall
	;;
"--update" )
	update
	;;
* )
	usage
	;;
esac