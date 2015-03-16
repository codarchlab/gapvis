
# GapVis for Hellespont

         

 [GapVis Frontend](http://gapvis.hellespont.dainst.org/) with Hellespont specific modifications
 
 [GitHub repository](https://github.com/karen-sch/gapvis)

## History of GapVis

The "Gap" in GapVis originally stands for [Google Ancient Places](http://googleancientplaces.wordpress.com/about/).
The aim of the project was to automatically extract place names from ancient texts that are available in Google Books and to map these places to the Gazetteer [Pleiades](http://pleiades.stoa.org/) to have an URI, coordinates and additional information for each place.
To visualize the results of the project, the interface [GapVis](http://gap.alexandriaarchive.org/gapvis/index.html#index) was created by programmer Nick Rabinowitz in the JavaScript framework [Backbone.js](http://backbonejs.org/).

GapVis offers the possibility to read a text page by page and see each mentioned place both highlighted in the text itself and on a map next to it as well.
![](http://hellespont.dainst.org/startpage/assets/img/examples/gapvis_original.png)

Each place has its own detail page where you can see related places (that are mentioned on the same pages) and links to more information in other interfaces.
![](http://hellespont.dainst.org//startpage/assets/img/examples/gapvis_original2.png)

Because GapVis is [Open Source software](https://github.com/nrabinowitz/gapvis) and because Hellespont in part has similar data (A text by Thucydides and annotated things inside the text) and similar visualization requirements, it was decided to use the GapVis code and modify it for Hellespont needs. 
A big difference is that Hellespont data is not based on automatically generated place references but on TEI files that were manually tagged. Not only places were tagged but also persons and organisations. Furthermore a Hellespont visualization needs to be able to show completely different data as well: linguistic trees, secondary literature and both historical and linguistic event data.

The first challenge was to create a backend to communicate with the Backbone.js based GapVis frontend. The original GapVis runs on static JSON files, but for Hellespont we wanted to use a dynamic API that could on the one hand be extended for all our data needs in the future and on the other be able to aggregate data from different sources.
This API was then built based on the Java framework Spring. Because the Thucydides text was tagged with the Arachne entity URIs in the TEI files, it was easy to extract all information needed for visualization directly from the Arachne MySQL database, this includes a title, latitude and longitude coordinates, and corresponding URIs in other databases for each entity, for example the place URIs of the [iDAI.gazetteer](http://gazetteer.dainst.org/). Where it was necessary, all person records were assigned a birth place (at least where this information was known). This birth place could then be used in GapVis to visualize the persons on the map alongside with the annotated places.
The Greek text of the individual chapters themselves comes directly from the TEI files which are transformed into HTML with the help of XSLT and then displayed in the text portion of the interface. The different kinds of entities can be distinguished by their corresponding colours.
While like in the original GapVis there is always a complete chapter of Thucydides on display, the user has the possibility to select singular passages. When a passage is selected, the currently active CTS-URN changes along with it. In the event and secondary literature view the data displayed is always in sync with the current CTS-URN, there is also at every step a link back to the Thucydides passage in Perseus.

## Reading View

The Reading View always shows the currently active passage of the _Pentecontaetia_ with annotated entities in different colors on the left hand side. The user can decide if he or she wants to concentrate on the entities themselves, the events, or the secondary literature for the current passage. There is also an English translation available for the Thucydides text.

### Time Map View

![](http://hellespont.dainst.org//startpage/assets/img/examples/gapvis_neu1.png)

The Time Map View shows a selected entity from the text on the map, along with an intratextual timeline of all entities mentioned throughout the chapters. There is the possibility to zoom into the map, to go to the Entity Detail View, or to jump to another chapter that also mentions the chosen entity.

### Event List View

![](http://hellespont.dainst.org//startpage/assets/img/examples/gapvis_neu2.png)

The Event List View shows all events for the currently active passage, manually created historical events as well as automatically generated linguistic events. It is possible to click on each event to go to the Event Detail View, for linguistic events there are also links to the Tree View in which the particular event node is then highlighted. To narrow down the list of events the user can also choose a subsection from the chapter on the left.

### Secondary Literature View

![](http://hellespont.dainst.org//startpage/assets/img/examples/gapvis_neu3.png)

For those text passages where there is extracted secondary literature, this information can also be visualized on the right side. There is a list of papers that mention this particular text passage and for each there is a link to the full text of the paper on JSTOR and an extendable list of other citations occurring in the paper. These citations are again connected to Perseus with CTS-URNs.

## Entity Detail View

![](http://hellespont.dainst.org//startpage/assets/img/examples/gapvis_neu4.png)

If an entity has been selected it can be viewed in the Entity Detail View. Here the user can find links to Arachne and the iDAI.gazetteer and also to other databases like Pleiades, DBpedia and dictionaries hosted on Perseus. There is also a list of co-referenced entities (this means entities that are frequently mentioned in the same chapters) with links and a visualization on the map. Additionally, there are sometimes pictures from Arachne and Flickr.

## Event Detail View

![](http://hellespont.dainst.org//startpage/assets/img/examples/gapvis_neu5.png)

The Event Detail View offers information about a singular event. This information is retrieved from the [ThucDb](#ThucDb) and includes related events, actors, places and the secondary literature where this event has been documented.

## Tree View

![](http://hellespont.dainst.org//startpage/assets/img/examples/gapvis_neu6.png)

The Tree View offers the currently active text passage without entity annotations on the left and two types of linguistic trees - syntactical and tectogrammatical - on the right. The images of the trees are based on SVG files created from Treebank data. The user can hover over each word or node to see it highlighted in both trees and the text passage. Clicking makes the selection more permanent, this is useful for moving around inside the trees without losing the highlighted node.

# Install guide

First: An EXist database and the Java backend (as a WAR file in the Tomcat) have to be up and running!

Check out the git repository into "/var/www":

<pre>
sudo git clone https://github.com/karen-sch/gapvis.git
</pre>

Go to folder /var/www/gapvis/lib and check out "backbone-spf" by Nick Rabinowitz:

<pre>
sudo git clone https://github.com/nrabinowitz/backbone-spf.git
</pre>

Before you build, you have to make sure that

* Java SDK is installed (not just JRE). To install: `sudo apt-get install openjdk-6-jdkà
* Apache Ant has to be installed, additionally you need a jar file with Ant-Contrib tasks: http://ant-contrib.sourceforge.net/
* For this: go to "/usr/share/java" and download ant-contrib-1.0b3.jar, for example from here: `sudo wget http://mirrors.ibiblio.org/pub/mirrors/maven2/ant-contrib/ant-contrib/1.0b3/ant-contrib-1.0b3.jar`
* Create a symlink in "usr/share/ant": `sudo cp -s /usr/share/java/ant-contrib-1.0b3.jar /usr/share/ant/lib/ant-contrib-1.0b3.jar`

* A new version of less (http://lesscss.org/) needs to be installed.
* For this you need to have new versions of node.js and npm, the ones from apt-get might be too old. How to get them: http://stackoverflow.com/a/21715730
* Then you can install less via npm: `sudo npm install -g less`

Now the ant build can be executed:

* Go to "/var/www/gapvis" 
* Type in `sudo ant`
* The build should be successful!

Contact: http://hellespont.dainst.org/ / hellespont-project@uni-koeln.de  
