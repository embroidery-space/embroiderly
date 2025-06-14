# `commands`

This directory contains all the commands utilized by the frontend.

By default, Tauri requires the use of JSON for communication between the frontend and backend.
However, we opt for the [Borsh] format, which encodes data in a binary format.
As a result, we accept raw binary buffers for complex structures and use JSON for primitive data types.
This approach keeps the code consistent and efficient by minimizing JSON overhead, which, while not significant in our case, is beneficial to avoid.

It's important to note that the commands themselves do not perform complex operations.
Instead, they simply accept data and invoke actions that carry out the required work.

Actions may emit events to the frontend because commands can involve multiple state changes.
It is often more straightforward to return results through several events.
The data for these events is also encoded using the [Borsh] format.
Importantly, the encoded binary buffer is then further encoded using Base64 to prevent JSON overhead when handling byte arrays.
This intermediate step may be eliminated in the future once Tauri's Event System supports binary data in events.

[Borsh]: https://github.com/near/borsh
