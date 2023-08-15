const ScormCloud = require('@rusticisoftware/scormcloud-api-v2-client-javascript');
const fs = require('fs');
const prompt = require('prompt-sync')({ sigint: true });

// ScormCloud API credentials
// Note: These are not the same credentials used to log in to ScormCloud
const APP_ID = 'P8JMFVB0IC';
const SECRET_KEY = 'D6jWRBG8fM7Hg3oq8jD2dcbnXWifTOrW2HHPe4e0';

// Sample values for data
const COURSE_PATH =
  '/PATH/TO/COURSE/RunTimeAdvancedCalls_SCORM20043rdEdition.zip';
let COURSE_FILE;

const COURSE_ID =
  'ChildCourse12_v0.0.4_2023-08-1536aaeff9-ba92-40d0-9dac-ab0df4f68062';
const LEARNER_ID = 'MOHAMED';
const REGISTRATION_ID = 'RANDOM-REGISTRATION-ID';

// Configure HTTP basic authorization: APP_NORMAL
const APP_NORMAL = ScormCloud.ApiClient.instance.authentications['APP_NORMAL'];
APP_NORMAL.username = APP_ID;
APP_NORMAL.password = SECRET_KEY;

// String used for output formatting
const OUTPUT_BORDER =
  '---------------------------------------------------------\n';

function cleanUp(courseId, registrationId) {
  function cleanUpLogic() {
    // This call will use OAuth with the "delete:registration" scope
    // if configured.  Otherwise the basic auth credentials will be used
    const registrationApi = new ScormCloud.RegistrationApi();
    registrationApi.deleteRegistration(registrationId, function (error) {
      if (error) {
        throw error;
      }
    });
  }

  // (Optional) Further authenticate via OAuth token access
  // First line is with OAuth, second is without
  // configureOAuth([ "delete:course", "delete:registration" ], cleanUpLogic);
  cleanUpLogic();
}

function logErrorAndCleanUp(error) {
  console.error(error);

  // Delete all the data created by this sample
  cleanUp(COURSE_ID, REGISTRATION_ID);
}

function buildLaunchLink(registrationId) {
  return new Promise((resolve, reject) => {
    const registrationApi = new ScormCloud.RegistrationApi();
    const settings = { redirectOnExitUrl: 'Message' };
    registrationApi.buildRegistrationLaunchLink(
      registrationId,
      settings,
      function (error, data) {
        if (error) {
          reject(error.response.text);
        }

        resolve(data.launchLink);
      }
    );
  });
}

function createRegistration(courseId, learnerId) {
  // generate random strig
  return new Promise((resolve, reject) => {
    const registrationApi = new ScormCloud.RegistrationApi();
    const learner = { id: learnerId };
    const registrationId = `R-${Date.now()}`;
    const registration = {
      courseId: courseId,
      learner: learner,
      registrationId: registrationId,
    };
    registrationApi.createRegistration(registration, {}, function (error) {
      if (error) {
        reject(error.response);
      }

      resolve(registrationId);
    });
  });
}

const getLearnerRegistrations = (courseId, learnerId) => {
  return new Promise((resolve, reject) => {
    const registrationApi = new ScormCloud.RegistrationApi();
    const registrationList = [];
    function getPaginatedRegistrations(more) {
      registrationApi.getRegistrations(
        { courseId, learnerId, more },
        function (error, data) {
          if (error) {
            reject(error.response);
          }

          registrationList.push(...data.registrations);

          if (data.more) {
            return getPaginatedRegistrations(data.more);
          }

          resolve(registrationList);
        }
      );
    }
    getPaginatedRegistrations(null);
  });
};

const getResultForRegistration = (registrationId) => {
  return new Promise((resolve, reject) => {
    const registrationApi = new ScormCloud.RegistrationApi();
    registrationApi.getRegistrationProgress(
      registrationId,
      {},
      function (error, data) {
        if (error) {
          reject(error.response);
        }
        resolve(data);
      }
    );
  });
};

const getLaunchLink = async (req, res) => {
  try {
    const { courseId, learnerId } = req.query;
    let registrationId = null;
    try {
      const [registration] = await getLearnerRegistrations(courseId, learnerId);
      registrationId = registration.id;
    } catch (err) {
      console.log(err);
      registrationId = await createRegistration(courseId, learnerId);
    }
    console.log(registrationId);
    const launchLink = await buildLaunchLink(registrationId);
    console.log(launchLink);
    res.json({ launchLink, registrationId });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

const getCompletionStatus = async (req, res) => {
  try {
    const { registrationId } = req.query;
    const result = await getResultForRegistration(registrationId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

module.exports = {
  getLaunchLink,
  getCompletionStatus,
};
