<script>
  import axios from 'axios';
  import { onMount, createEventDispatcher } from 'svelte';

  export let upload_url;
  export let dataset_id;
  export let resource_id;
  export let update = '';
  export let current_url;
  export let url_type = ''

  let fileVar;
  let percentage = 0;
  let is_uploading = false
  let is_waiting = false
  let is_completed = false
  let dispatch = createEventDispatcher()
  let action_type = update?'update':'create'
  let new_url = ''
  let resource_type = url_type
  let resource_url = ''
  let current_file_url = ''

  if (url_type != 'upload') {
    resource_url = current_url
  } else {
    current_file_url = getFilename(current_url)
  }

  async function uploadFile (body, setPercentage) {
    try {
      const options = {
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percent = Math.floor((loaded * 100) / total);
  
          if (percent <= 100) {
            setPercentage(percent);
            if (percent == 100) { 
              is_uploading = false
              is_waiting = true
            }
          }
        }
      };
  
      const ckan_endpoint = (action_type == 'update') ?
          `${upload_url}/dataset/${dataset_id}/resource/${resource_id}/file` :
          `${upload_url}/dataset/${dataset_id}/resource/file`

      const { data } = await axios.post(
        ckan_endpoint,
        body,
        options
      );
  
      return data;
    } catch (error) {
      console.log('ERROR', error.message);
    }
  }

  function setPercentage(newPercentage) {
    percentage = newPercentage
  }

  function getFilename(url) {
    let urlParts = url.split('/')
    if (urlParts.length > 0) {
      return urlParts[urlParts.length - 1]
    } else {
      return urlParts[0]
    }
  }

  function changeResourceType(url_type) {
      resource_type = url_type
  }

  async function handleFileChange(event) {
    try {
      const file = event.target.files[0];
      const formData = new FormData();

      formData.append("upload", file);
      formData.append("package_id", dataset_id)

      // If it's updating a already existing resource
      // add some additional fields
      if (update) {
          formData.append("id", resource_id)
          formData.append("clear_upload", true)
          formData.append("url_type", url_type)
      }

      is_uploading = true
      let returnData = await uploadFile(formData, setPercentage);
      let eventData = {
        data: returnData,
      }
      current_file_url = getFilename(returnData.url)
      url_type = 'upload'
      dispatch('fileUploaded', eventData)
      is_waiting = false
      is_completed = true
    } catch (err) {
      console.log('ERROR', err);
      setPercentage(0);
    }
  }
</script>

<div class="ckan-resource-upload-field form-group">

  <!-- Upload / Link buttons -->
  <input type="radio" id="resource-url-none" name="url_type" value="" checked="">
  <div class="select-type">
    <label id="resource-menu-label" class="form-label">Data</label>
    <div role="group" aria-labelledby="resource-menu-label">
      <button type="button" class="btn btn-default" id="resource-upload-button" title="Upload a file on your computer" onclick="
              document.getElementById('resource-url-upload').checked = true;
              document.getElementById('field-resource-upload').click();
            "><i class="fa fa-cloud-upload"></i>Upload</button>
      <button type="button" class="btn btn-default" id="resource-link-button" title="Link to a URL on the internet (you can also link to an API)" onclick="
              document.getElementById('resource-url-link').checked = true;
              document.getElementById('field-resource-url').focus();
            "><i class="fa fa-globe"></i>Link</button>
    </div>
  </div>


  <!-- File input -->
  <input type="radio" id="resource-url-upload" name="url_type" value="upload">
  <div class="select-type">
    <div class="upload-type">
      <button type="button" class="btn btn-danger btn-remove-url-upload" onclick="
        document.getElementById('resource-url-none').checked = true;
        document.getElementById('resource-upload-button').focus();
        $('#field-resource-upload').replaceWith($('#field-resource-upload').val('').clone(true))
      ">Remove</button>

      <div class="form-group control-full">
        <label class="form-label" for="field-resource-upload">File</label>
        <div class="controls ">
          <input id="field-resource-upload" type="file" name="upload" value="" placeholder="" class="form-control">
        </div>
      </div>
    </div>

  </div>


  <!-- URL input -->
  <input type="radio" id="resource-url-link" name="url_type" value="">
  <div class="select-type">

    <button type="button" class="btn btn-danger btn-remove-url-upload" onclick="
        document.getElementById('resource-url-none').checked = true;
        document.getElementById('resource-upload-button').focus();
        $('#field-resource-url').val('')
      ">Remove</button>

    <div class="form-group control-full">
      <label class="form-label" for="field-resource-url">URL</label>
      <div class="controls ">
        <input id="field-resource-url" type="url" name="url" value="" placeholder="http://example.com/external-data.csv" class="form-control">
      </div>
    </div>
  </div>

</div>


<style>

  .ckan-resource-upload-field > input[type=radio] {
    display: none;
  }

  .ckan-resource-upload-field > div.select-type {
    position: relative;
    display: none;
  }

  .ckan-resource-upload-field > input[type=radio]:checked + div.select-type {
    display: block;
  }

  .ckan-resource-upload-field label.btn::after {
    content: "";
  }

  .ckan-resource-upload-field .btn-remove-url .icon-remove {
    margin-right: 0;
  }

  .ckan-resource-upload-field input#field-clear-upload {
    display: none;
  }

  .ckan-resource-upload-field input#field-clear-upload + div.upload-type {
    display: block;
  }

  .ckan-resource-upload-field input#field-clear-upload ~ .upload-type {
    display: none;
  }

  .ckan-resource-upload-field input#field-clear-upload:checked + div.upload-type {
    display: none;
  }

  .ckan-resource-upload-field input#field-clear-upload:checked ~ .upload-type {
    display: block;
  }

  .ckan-resource-upload-field .btn-remove-url-upload {
    position: absolute;
    margin-right: 0;
    margin-top: 11px;
    top: 1.5em;
    right: 0.25em;
    padding: 0 12px;
    border-radius: 100px;
  }

</style>
