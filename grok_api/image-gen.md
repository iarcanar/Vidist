#### Guides

# Image Generations and Edits

You can provide some descriptions of the image you would like to generate, and let the model generate one or multiple pictures in the output.

If you're used to chatting with language models, interacting with image generation works a little differently.
You only need to send a prompt text in the request, instead of a list of messages with system/user/assistant roles.

&#x20;Note: You can also animate the image using [](/docs/guides/video-generations).&#x20;

## Parameters

Note: `quality` is not supported by xAI API at the moment.

## Generate an image

Our image generation capability is offered at endpoint `https://api.x.ai/v1/images/generations`.

```pythonXAI
import os

from xai_sdk import Client

client = Client(api_key=os.getenv('XAI_API_KEY'))

response = client.image.sample(
    model="grok-imagine-image",
    prompt="A cat in a tree",
    image_format="url"
)

print(response.url)
```

```pythonOpenAISDK
import os
from openai import OpenAI

XAI_API_KEY = os.getenv("XAI_API_KEY")
client = OpenAI(base_url="https://api.x.ai/v1", api_key=XAI_API_KEY)

response = client.images.generate(
    model="grok-imagine-image",
    prompt="A cat in a tree"
)

print(response.data[0].url)
```

```javascriptOpenAISDK
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: "<api key>",
    baseURL: "https://api.x.ai/v1",
});

const response = await openai.images.generate({
    model: "grok-imagine-image",
    prompt: "A cat in a tree",
});
console.log(response.data[0].url);
```

```bash
curl -X 'POST' https://api.x.ai/v1/images/generations \\
-H 'accept: application/json' \\
-H 'Authorization: Bearer <API_KEY>' \\
-H 'Content-Type: application/json' \\
-d '{
    "model": "grok-imagine-image",
    "prompt": "A cat in a tree"
}'
```

By default, `image_format` will be `url` and the generated image will be available for download. You can also specify a base64-encoded image output.

The Python and JavaScript examples will print out url of the image on xAI managed storage.

This is an example image generated from the above prompt:

## Edit an Image

You can also edit an image with prompts. For example, if you have created an image named `cat-in-tree.jpg`:

```pythonXAI
import os
from xai_sdk import Client

client = Client(api_key=os.getenv('XAI_API_KEY'))

with open("cat-in-tree.jpg", "rb") as image_file:
    image_bytes = image_file.read()
    base64_string = base64.b64encode(image_bytes).decode("utf-8")

response = client.image.sample(
    model="grok-imagine-image",
    image_url=f"data:image/jpeg;base64,{base64_string}",
    prompt="Swap the cat in the picture with a dog."
)

print(response.url)
```

```pythonOpenAISDK
import os
from openai import OpenAI

XAI_API_KEY = os.getenv("XAI_API_KEY")
client = OpenAI(base_url="https://api.x.ai/v1", api_key=XAI_API_KEY)

response = client.images.edit(
    model="grok-imagine-image",
    image=[
        open("cat-in-tree.jpg", "rb"),
    ],
    prompt="Swap the cat in the picture with a dog."
)

print(response.data[0].url)
```

```javascriptOpenAISDK
import fs from "fs";
import OpenAI, { toFile } from "openai";

await toFile(fs.createReadStream("cat-in-tree.jpg"), null, {
    type: "image/jpg",
}

const openai = new OpenAI({
    apiKey: "<api key>",
    baseURL: "https://api.x.ai/v1",
});

const response = await openai.images.edit({
    model: "grok-imagine-image",
    prompt: "Swap the cat in the picture with a dog.",
});

console.log(response.data[0].url);
```

```bash
curl -X 'POST' https://api.x.ai/v1/images/edits \\
-H 'accept: application/json' \\
-H 'Authorization: Bearer <API_KEY>' \\
-H 'Content-Type: application/json' \\
-d '{
    "model": "grok-imagine-image",
    "image": <base64-encoded data string of the picture or a public URL>,
    "prompt": "Swap the cat in the picture with a dog."
}'
```

## Base 64 JSON Output

Instead of getting an image url by default, you can choose to get a base64 encoded image.
To do so, you need to specify `"response_format": "b64_json"` in the REST API request, or `"format": "IMG_FORMAT_BASE64"` in the gRPC API request.

```pythonXAI
import os

from xai_sdk import Client

client = Client(api_key=os.getenv('XAI_API_KEY'))

response = client.image.sample(
    model="grok-imagine-image",
    prompt="A cat in a tree",
    image_format="base64"
)

print(response.image) # returns the raw image bytes
```

```pythonOpenAISDK
import os

from openai import OpenAI

XAI_API_KEY = os.getenv("XAI_API_KEY")
client = OpenAI(base_url="https://api.x.ai/v1", api_key=XAI_API_KEY)

response = client.images.generate(
    model="grok-imagine-image",
    prompt="A cat in a tree",
    response_format="b64_json"
)

print(response.data[0].b64_json)
```

```javascriptOpenAISDK
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: "<api key>",
    baseURL: "https://api.x.ai/v1",
});

const response = await openai.images.generate({
    model: "grok-imagine-image",
    prompt: "A cat in a tree",
    response_format: "b64_json"
});
console.log(response.data[0].b64_json);
```

```javascriptAISDK
import { xai } from '@ai-sdk/xai';
import { experimental_generateImage as generateImage } from 'ai';

const result = await generateImage({
    model: xai.image('grok-imagine-image'),
    prompt: 'A cat in a tree',
});

console.log(result.image.base64Data);
```

```bash
curl -X 'POST' https://api.x.ai/v1/images/generations \\
-H 'accept: application/json' \\
-H 'Authorization: Bearer <API_KEY>' \\
-H 'Content-Type: application/json' \\
-d '{
    "model": "grok-imagine-image",
    "prompt": "A cat in a tree",
    "response_format": "b64_json"
}'
```

In the response image object, you will get a `b64_json` field for REST API, or `base64` for gRPC API.

## Generating multiple images

You can generate up to 10 images in one request by adding a parameter `n` in your request body. For example, to generate four images:

```pythonXAI
import os

from xai_sdk import Client

client = Client(api_key=os.getenv('XAI_API_KEY'))

response = client.image.sample_batch(
    model="grok-imagine-image",
    prompt="A cat in a tree",
    n=4,
    image_format="url",
)

for image in response:
    print(image.url)
```

```pythonOpenAISDK
import os

from openai import OpenAI

XAI_API_KEY = os.getenv("XAI_API_KEY")
client = OpenAI(base_url="https://api.x.ai/v1", api_key=XAI_API_KEY)

responses = client.images.generate(
    model="grok-imagine-image",
    prompt="A cat in a tree",
    n=4
)
for response in responses.data:
    print(response.url)
```

```javascriptOpenAISDK
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: "<api key>",
    baseURL: "https://api.x.ai/v1",
});

const response = await openai.images.generate({
    model: "grok-imagine-image",
    prompt: "A cat in a tree",
    n: 4
});
response.data.forEach((image) => {
    console.log(image.url);
});
```

```javascriptAISDK
import { xai } from '@ai-sdk/xai';
import { experimental_generateImage as generateImage } from 'ai';

const result = await generateImage({
    model: xai.image('grok-imagine-image'),
    prompt: 'A cat in a tree',
    n: 4,
});

console.log(result.images);
```

```bash
curl -X 'POST' https://api.x.ai/v1/images/generations \\
  -H 'accept: application/json' \\
  -H 'Authorization: Bearer <API_KEY>' \\
  -H 'Content-Type: application/json' \\
  -d '{
      "model": "grok-imagine-image",
      "prompt": "A cat in a tree",
      "n": 4
  }'
```

## Setting Aspect Ratio for the Image

You can set an aspect ratio for a generated image. For example, to generate a 4:3 image, you can set

```pythonXAI
import os

from xai_sdk import Client

client = Client(api_key=os.getenv('XAI_API_KEY'))

response = client.image.sample_batch(
    model="grok-imagine-image",
    prompt="A cat in a tree",
    aspect_ratio="4:3"
)

for image in response:
    print(response.url)
```

```pythonOpenAISDK
import os

from openai import OpenAI

XAI_API_KEY = os.getenv("XAI_API_KEY")
client = OpenAI(base_url="https://api.x.ai/v1", api_key=XAI_API_KEY)

responses = client.images.generate(
    model="grok-imagine-image",
    prompt="A cat in a tree",
    aspect_ratio="4:3"
)
for response in responses:
    print(response.url)
```

```javascriptOpenAISDK
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: "<api key>",
    baseURL: "https://api.x.ai/v1",
});

const response = await openai.images.generate({
    model: "grok-imagine-image",
    prompt: "A cat in a tree",
    aspect_ratio: "4:3"
});
response.data.forEach((image) => {
    console.log(image.url);
});
```

```javascriptAISDK
import { xai } from '@ai-sdk/xai';
import { experimental_generateImage as generateImage } from 'ai';

const result = await generateImage({
    model: xai.image('grok-imagine-image'),
    prompt: 'A cat in a tree',
    aspectRatio: '4:3'
});

console.log(result.images);
```

```bash
curl -X 'POST' https://api.x.ai/v1/images/generations \\
  -H 'accept: application/json' \\
  -H 'Authorization: Bearer <API_KEY>' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "model": "grok-imagine-image",
    "prompt": "A cat in a tree",
    "aspect_ratio": "4:3"
  }'
```
