<img alt="Horus Banner" src="https://raw.githubusercontent.com/spheras/horus/master/etc/horus.png" width="200" height="200" align="right">

# HORUS
Monitoring, Management and Planning of Personnel involved in Search Actions in Large Areas

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)


## Description
The search for missing persons in rural areas is a problem with great social repercussions, which demands a rapid response from the administrations.  It requires them to be planned in a systematised and organised manner.  The search is an emergency, it requires an immediate response to save lives and minimize risks. They need complex coordination structures for their management:

1. They generate a demand for personnel that is going to be prolonged in time and that exceeds ordinary resources.
1. They require collaboration between Administrations and Institutions of diverse nature.
1. The wild environment in which they are developed entails risks for the members of the search.

For the management of the search are used:

- [x] Geographic Information Systems ([GIS](https://en.wikipedia.org/wiki/Geographic_information_system)).
- [x] Global Navigation Satellite Systems ([GNSS](https://en.wikipedia.org/wiki/Satellite_navigation)).
- [x] Real Time Location Systems ([RTLS](https://en.wikipedia.org/wiki/Real-time_locating_system)).

The systems currently used to monitor work and record information present a major challenge for this type of emergency. The following questions arise in the management and coordination of such arrangements:

1. The work is being carried out in a hostile environment and many of the people carrying out field tasks are neither professionals nor trained in this type of work.
1. The planned tasks are really being carried out correctly.

**HORUS** is free [![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0) tool that adapts to the needs of this type of situation, allowing an agile and effective follow-up of the work, and an organized record of the information that facilitates the analysis.

![Horus ScreenShot](https://raw.githubusercontent.com/spheras/horus/master/etc/readme_assets/screenshots1.png)

## Aims and Objectives

From a __functional__ point of view:

- [x] To increase the safety of the participants.
- [x] Facilitate search management.
- [x] Follow up tasks.
- [x] Track resources in real time.
- [x] Facilitate coordination.
- [x] Facilitate the planning and probability of success of future searches.

From a __technological__ perspective:

- [x] To be a free and specifically designed tool for the management, coordination and planning of searches in large areas.
- [x] Mobile application with RTLS system.
- [x] Desktop application with a GIS viewer from which to track.
- [x] Spatial database to store spatial information generated.


## Architecture

The application is divided in three main components: two frontends (desktop and mobile) and a backend.

<img alt="Horus Basic Components" src="https://raw.githubusercontent.com/spheras/horus/master/etc/readme_assets/components.png" width="600" height="600">
![Horus Basic Components](https://raw.githubusercontent.com/spheras/horus/master/etc/readme_assets/components1.png)

The __backend__ is the responsible to retrieve and save information into the database (spatial database) with some minor logic about how to store and retrieve the information mainly. This module provide the REST services to perform all those actions. 

Moreover, the application provide two different __frontends__. On one hand we have the desktop frontend, which is the most relevant in terms of administration, thus it is the the way the user can manage Searches, and analyze in real time all the information incoming to the application.  On the other hand there is a mobile frontend which provide the real time track information to the platform. Those devices are the reponsibles to send the track data to the platform, giving also to the user the oportunity to send other information like pictures, comments, alarms and others regarding a certain position.

![Horus Physical Components](https://raw.githubusercontent.com/spheras/horus/master/etc/readme_assets/components2.png)

Technologically speaking

## Building and Installing

## Contributing
