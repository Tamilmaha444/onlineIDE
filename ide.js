window.onload = (event) => {
  $.ajax(getLanguages).then((languages) => {
    languages.forEach(lang => {
      $('#languages').append(`<option value="${lang.id}">${lang.name}</option>`);
    });
    $("#languages").change((e) => {
      $('#code').val(sourceMapping[e.target.value]);
      $('#code').linenumbers();
    });
    $("#languages").change();
  });
};

var getLanguages = {
  "async": true,
  "crossDomain": true,
  "url": "https://judge0.p.rapidapi.com/languages",
  "method": "GET",
  "headers": {
    "x-rapidapi-host": "judge0.p.rapidapi.com",
    "x-rapidapi-key": "228f08c95cmshd38bca46e77eb68p1ec4eejsn3ef6e2e96257",
  }
}

function createSubmission() {
  if (this.underProcess) {
    return;
  }
  this.underProcess = true;
  $("#spin").show();
  $("#run").hide();
  let settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://judge0.p.rapidapi.com/submissions/",
    "method": "POST",
    "headers": {
      "x-rapidapi-host": "judge0.p.rapidapi.com",
      "x-rapidapi-key": "228f08c95cmshd38bca46e77eb68p1ec4eejsn3ef6e2e96257",
      "content-type": "application/json",
      "accept": "application/json"
    },
    "processData": false,
    "data": JSON.stringify({
      language_id: Number($("#languages").val()),
      source_code: $("#code").val(),
      stdin: $("#input").val()
    })
  }
  $.ajax(settings).done(function (response) {
    console.log(response);
    getSubmission(response.token);
  });
}

function getSubmission(token) {
  $.ajax({
    "async": true,
    "crossDomain": true,
    "url": "https://judge0.p.rapidapi.com/submissions/" + token + "?base64_encoded=true",
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "judge0.p.rapidapi.com",
      "x-rapidapi-key": "228f08c95cmshd38bca46e77eb68p1ec4eejsn3ef6e2e96257"
    }
  }).then((output) => {
    if (output.status.id == 1 || output.status.id == 2) {
      getSubmission(token);
    }
    else {
      this.resultObj = {
        compile_output: decode(output.compile_output),
        memory: output.memory,
        message: decode(output.message),
        id: output.id,
        status: output.status,
        stderr: decode(output.stderr),
        stdout: decode(output.stdout),
        time: output.time,
        token: output.token,
      }
      this.underProcess = false;
      $("#spin").hide();
      $("#run").show();
      setResultTab(output.status.id == 3 ? "stdout" : "compile_output");
    }
  });
  return
}

function decode(bytes) {
  let escaped = escape(atob(bytes || ""));
  try {
    return decodeURIComponent(escaped);
  }
  catch {
    return unescape(escaped);
  }
}

function setResultTab(tab) {
  $('a').removeClass("active");
  $('#' + tab).addClass("active");
  $("#output").text(resultObj[tab]);
  $("#output_message").text((resultObj.status.id === 3 ? "Success" : resultObj.status.description) + " !");
  $("#output_message").css({
    "color": resultObj.status.id === 3 ? "green" : "red"
  });
}

