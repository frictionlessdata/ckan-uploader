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
  // State variable to check if the file is being upload
  let is_uploading = false
  // State variable to check if we are waiting for the server response (e.g. detecting the schema)
  let is_waiting = false
  // State variable to check after the file is uploaded and the server already returned a response
  let is_completed = false
  let dispatch = createEventDispatcher()
  let action_type = update?'update':'create'
  let new_url = ''
  let resource_type = url_type
  let resource_url_none = action_type === 'create'
  let resource_url = ''
  let current_file_url = ''
  let removed_file = false

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
      resource_url_none = false
      resource_type = url_type

      if (url_type != 'upload') {
          if (removed_file)
            removed_file = false
      }
  }

  function fileInput(node) {
      if (!removed_file) {
          node.click()
      }
  }

  function urlInput(node) {
    node.focus()
  }

  function removeFileUpload() {
      removed_file = true
      current_file_url = ''
      fileVar = ''
      is_uploading = false
      is_waiting = false
      is_completed = false
      percentage = 0
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
  <input type="checkbox" id="resource-url-none" name="url_none" value="" checked={resource_url_none}>

  <div class="select-type">
    <div role="group" aria-labelledby="resource-menu-label">
      <button type="button" class="btn btn-default" id="resource-upload-button" title="Upload a file on your computer"  on:click={(e) => { changeResourceType('upload') }}>
            <i class="fa fa-cloud-upload"></i>Upload</button>
      <button type="button" class="btn btn-default" id="resource-link-button" title="Link to a URL on the internet (you can also link to an API)"   on:click={(e) => { changeResourceType('') }}>
            <i class="fa fa-globe"></i>Link</button>
    </div>
  </div>


  <!-- File input -->
  <input type="checkbox" id="resource-url-upload" name="url_upload" checked={resource_type == 'upload'}>
  {#if resource_type == 'upload'}
  <input readonly={(url_type != 'upload')?undefined:true } id="field_url" class="form-control" type="text" name="url" bind:value={current_file_url}>
  <div class="select-type">
    <div class="upload-type">
      <button type="button" class="btn btn-danger btn-remove-url-upload" on:click={(e) => { removeFileUpload() }}>
      Remove</button>

      <div class="form-group control-full">
        <label class="form-label" for="field-resource-upload">File</label>
        <div class="controls ">
          {#if current_file_url != ''}
            {current_file_url}
          {:else}
          <input id="field-resource-upload" type="file" name="upload" class="form-control" use:fileInput bind:files={fileVar} on:change={handleFileChange}>
          {#if is_uploading }
          <div id="progress-info">
             <div class="percentage-text">
               {#if !is_waiting }
                 {`⌛ Uploading... ${percentage}%`}
               {:else }
                 <div>Waiting for data schema detection...</div>
               {/if}
               {#if is_completed }
                 <div>File uploaded</div>
               {/if}
             </div>
             <div id="percentage">
               <div id="percentage-bar" style:width="{percentage}%"></div>
             </div>
         </div>
         {/if}
         {/if}
        </div>
      </div>
    </div>
  </div>
  {/if}

  {#if resource_type != 'upload' && !resource_url_none}
  <!-- URL input -->
  <input type="checkbox" id="resource-url-link" name="url_link" value="" checked={resource_type != 'upload'}>
  <div class="select-type">
    <div class="link-type">
      <button type="button" class="btn btn-danger btn-remove-url-upload" on:click={(e) => { resource_url = ''}}
        >Remove</button>

      <div class="form-group control-full">
        <label class="form-label" for="field-resource-url">URL</label>
        <div class="controls ">
          <input id="field-resource-url" type="url" name="url" bind:value={resource_url} use:urlInput placeholder="http://example.com/external-data.csv" class="form-control">
        </div>
      </div>
    </div>
  </div>
  {/if}

</div>


<style>
  .ckan-resource-upload-field > input[type=checkbox] {
    display: none;
  }

  .ckan-resource-upload-field > div.select-type {
    position: relative;
    margin-bottom: 10px;
  }

  .ckan-resource-upload-field > div.select-type > div.link-type {
  }

  .ckan-resource-upload-field > input[type=checkbox]:checked + div.select-type {
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
    display: none;
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

  #field_url {
    display: none;
  }

  #percentage {
    flex-grow: 1;
    height: 100%;
    align: middle;
    justify-content: center;
    display: flex;
    position: relative;
    float: left;
    min-height: 15px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  #progress-info {
    margin-top: 10px;
    display: flex;
  }

  .percentage-text {
    padding-right: 10px;
  }

  #percentage-bar {
    z-index: 10;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100%;
    transition: width 0.3s;
    transition-timing-function: ease-in;
    background-color: #005d7a;
  }

</style>
